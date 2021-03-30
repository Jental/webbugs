package main

import (
	"log"
	"runtime"
	"webbugs-server/models"
)

type processResult struct {
	events  []models.Event
	updates []models.Update
}

var emptyProcessResult processResult = processResult{events: make([]models.Event, 0), updates: make([]models.Update, 0)}

// Handle - handles single event
func (store *Store) Handle(event *models.Event) {
	store.eventQueue <- event
}

// Start - starts event hadling process
func (store *Store) Start() {
	// locker := NewLocker(store.field.PageRadius)
	go func() {
		for {
			event := <-store.eventQueue
			if !store.isLocked {
				go func() {
					result := store.processEvent(event)

					// lockerKeys := locker.LockForUpdates(result.updates)
					store.applyUpdates(result.updates)
					// locker.UnlockForKeys(lockerKeys)

					for _, event := range result.events {
						store.eventQueue <- &event
					}
				}()
			}
			log.Printf("Number of goroutines: %d", runtime.NumGoroutine())
		}
	}()
}

func (store *Store) processEvent(event *models.Event) processResult {
	log.Printf("events: event: %v", *event)

	switch casted := (*event).(type) {
	case models.ClickEvent:
		return store.processClickEvent(&casted)
	case models.SetBugEvent:
		return store.processSetBugEvent(&casted)
	case models.SetWallEvent:
		return store.processSetWallEvent(&casted)
	case models.UpdateComponentActivityEvent:
		return store.processUpdateComponentActivityEvent(&casted)
	case models.ClearCellsEvent:
		return store.processClearCellEvent(&casted)
	default:
		return emptyProcessResult
	}
}

func (store *Store) processClickEvent(event *models.ClickEvent) processResult {
	page := store.field.Get(event.Crd.Page)
	if page == nil {
		return emptyProcessResult
	}

	value := page.Get(event.Crd.Cell)
	if value == nil {
		neighbours := page.GetNeibhours(event.Crd.Cell)

		isActiveNeighbourPresent := false
		for _, n := range neighbours {
			if n != nil && n.PlayerID == event.PlayerID {
				if n.CellType == models.CellTypeBug {
					// log.Printf("events: processClickEvent: active neighbour: bug: %v", *n)
					isActiveNeighbourPresent = true
					break
				}

				if n.CellType == models.CellTypeWall && n.Component != nil && n.Component.IsActive {
					// log.Printf("events: processClickEvent: active neighbour: wall: %v %v", *n, *n.Component)
					isActiveNeighbourPresent = true
					break
				}
			}
		}

		if isActiveNeighbourPresent {
			newEvent := models.NewSetBugEvent(event.Crd, event.PlayerID, false)
			return processResult{
				events:  []models.Event{newEvent},
				updates: []models.Update{},
			}
		}

		return emptyProcessResult
	} else if value.CellType == models.CellTypeBug && value.PlayerID != event.PlayerID {
		neighbours := page.GetNeibhours(event.Crd.Cell)

		isActiveNeighbourPresent := false
		for _, n := range neighbours {
			if n != nil && n.PlayerID == event.PlayerID {
				if n.CellType == models.CellTypeBug {
					isActiveNeighbourPresent = true
					break
				}

				if n.CellType == models.CellTypeWall && n.Component != nil && n.Component.IsActive {
					isActiveNeighbourPresent = true
					break
				}
			}
		}

		if isActiveNeighbourPresent {
			newEvent := models.NewSetWallEvent(event.Crd, event.PlayerID)
			return processResult{
				events:  []models.Event{newEvent},
				updates: []models.Update{},
			}
		}

		return emptyProcessResult
	}

	return emptyProcessResult
}

func (store *Store) processSetBugEvent(event *models.SetBugEvent) processResult {
	page := store.field.Get(event.Crd.Page)
	if page == nil {
		return emptyProcessResult
	}

	newEvents := make([]models.Event, 0)
	newUpdates := make([]models.Update, 0)

	neighbours := page.GetNeibhours(event.Crd.Cell)

	ownNeighbourWallComponents := make([]*models.Component, 0)
	for _, n := range neighbours {
		if n != nil && n.CellType == models.CellTypeWall && n.PlayerID == event.PlayerID {
			alreadyAdded := false
			for _, onc := range ownNeighbourWallComponents {
				if onc == n.Component {
					alreadyAdded = true
					break
				}
			}

			if !alreadyAdded {
				ownNeighbourWallComponents = append(ownNeighbourWallComponents, n.Component)
			}
		}
	}

	// log.Printf("events: processSetBugEvent: ownNeighbourWallComponents: %v", len(ownNeighbourWallComponents))

	for _, cmp := range ownNeighbourWallComponents {
		isActive := true
		newUpdates = append(newUpdates, models.NewComponentsUpdate(cmp.ID, models.ComponentSetRequest{IsActive: &isActive}))
	}

	cellType := models.CellTypeBug
	newUpdates = append(newUpdates, models.NewFieldUpdate(event.Crd, &models.CellSetRequest{
		CellType: &cellType,
		PlayerID: event.PlayerID,
		IsBase:   &event.IsBase,
	}))

	return processResult{
		events:  newEvents,
		updates: newUpdates,
	}
}

func (store *Store) processSetWallEvent(event *models.SetWallEvent) processResult {
	page := store.field.Get(event.Crd.Page)
	if page == nil {
		return emptyProcessResult
	}

	newEvents := make([]models.Event, 0)
	newUpdates := make([]models.Update, 0)

	var component *models.Component

	wall := models.NewWallCell(event.PlayerID, event.Crd, page, nil)

	neighbours := page.GetNeibhours(event.Crd.Cell)

	ownNeighbourWallComponents := make([]*models.Component, 0)
	ownNeighbourBugs := make([]*models.Cell, 0)
	allNeighbourWallComponents := make([]*models.Component, 0)
	for _, n := range neighbours {
		if n != nil {
			if n.CellType == models.CellTypeWall {
				if n.PlayerID == event.PlayerID {
					alreadyAdded := false
					for _, onc := range ownNeighbourWallComponents {
						if onc == n.Component {
							alreadyAdded = true
							break
						}
					}

					if !alreadyAdded {
						ownNeighbourWallComponents = append(ownNeighbourWallComponents, n.Component)
					}
				}

				alreadyAdded := false
				for _, onc := range allNeighbourWallComponents {
					if onc == n.Component {
						alreadyAdded = true
						break
					}
				}

				if !alreadyAdded {
					allNeighbourWallComponents = append(allNeighbourWallComponents, n.Component)
				}
			}

			if n.CellType == models.CellTypeBug && n.PlayerID == event.PlayerID {
				ownNeighbourBugs = append(ownNeighbourBugs, n)
			}
		}
	}
	// log.Printf("events: processSetWallEvent: ownNeighbourWallComponents: %v", len(ownNeighbourWallComponents))
	// log.Printf("events: processSetWallEvent: ownNeighbourBugs: %v", len(ownNeighbourBugs))
	// log.Printf("events: processSetWallEvent: allNeighbourWallComponents: %v", len(allNeighbourWallComponents))

	if len(ownNeighbourWallComponents) == 0 {
		newComponent := models.NewComponent(
			len(ownNeighbourBugs) > 0,
			[]*models.Cell{&wall})
		component = &newComponent

		newUpdates = append(newUpdates, models.NewAddComponentUpdate(&newComponent))
	} else if len(ownNeighbourWallComponents) == 1 {
		component = ownNeighbourWallComponents[0]

		isActive := component.IsActive || len(ownNeighbourBugs) > 0
		newUpdates = append(newUpdates, models.NewComponentsUpdate(
			component.ID,
			models.ComponentSetRequest{
				IsActive: &isActive,
				Walls:    append(component.Walls, &wall),
			}))
	} else if len(ownNeighbourWallComponents) > 1 {
		allWalls := make([]*models.Cell, 0)
		for _, n := range ownNeighbourWallComponents {
			allWalls = append(allWalls, n.Walls...)
		}

		isActive := len(ownNeighbourBugs) > 0
		if !isActive {
			for _, n := range ownNeighbourWallComponents {
				if n.IsActive {
					isActive = true
					break
				}
			}
		}

		newComponent := models.NewComponent(
			isActive,
			append(allWalls, &wall))
		component = &newComponent

		newUpdates = append(newUpdates, models.NewAddComponentUpdate(&newComponent))

		for _, w := range allWalls {
			newUpdates = append(newUpdates, models.NewFieldUpdate(
				w.Crd,
				&models.CellSetRequest{
					Component: &newComponent,
				}))
		}

		for _, n := range ownNeighbourWallComponents {
			newUpdates = append(newUpdates, models.NewRemoveComponentUpdate(n.ID))
		}
	}

	wall.Component = component

	for _, n := range allNeighbourWallComponents {
		newEvents = append(newEvents, models.NewUpdateComponentActivityEvent(n))
	}

	cellType := models.CellTypeWall
	newUpdates = append(newUpdates, models.NewFieldUpdate(event.Crd, &models.CellSetRequest{
		CellType:  &cellType,
		Component: component,
		PlayerID:  event.PlayerID,
	}))

	return processResult{
		events:  newEvents,
		updates: newUpdates,
	}
}

func (store *Store) processUpdateComponentActivityEvent(event *models.UpdateComponentActivityEvent) processResult {
	if event.Component == nil || len(event.Component.Walls) == 0 {
		return emptyProcessResult
	}

	page := store.field.Get(models.NewCoordinates(0, 0, 0)) // TODO: fix page coordinates
	if page == nil {
		return emptyProcessResult
	}

	playerID := event.Component.Walls[0].PlayerID

	isActive := false
	for _, w := range event.Component.Walls {
		for _, n := range page.GetNeibhours(w.Crd.Cell) {
			if n != nil && n.CellType == models.CellTypeBug && n.PlayerID == playerID {
				isActive = true
				break
			}
		}
		if isActive {
			break
		}
	}

	if isActive != event.Component.IsActive {
		return processResult{
			events: make([]models.Event, 0),
			updates: []models.Update{
				models.NewComponentsUpdate(
					event.Component.ID,
					models.ComponentSetRequest{
						IsActive: &isActive,
					})},
		}
	}

	return emptyProcessResult
}

func (store *Store) processClearCellEvent(event *models.ClearCellsEvent) processResult {
	newEvents := make([]models.Event, 0)
	newUpdates := make([]models.Update, 0)

	componentsToBeUpdated := make(map[*models.Component][]*models.Cell)

	for _, crd := range event.Crd {
		page := store.field.Get(crd.Page) // TODO: fix page coordinates
		if page == nil {
			continue
		}
		cell := page.Get(crd.Cell)
		if cell == nil {
			continue
		}

		newUpdates = append(newUpdates, models.NewFieldUpdate(crd, nil))

		if cell.CellType == models.CellTypeWall {
			component := cell.Component

			entry, exists := componentsToBeUpdated[component]
			if exists {
				componentsToBeUpdated[component] = append(entry, cell)
			} else {
				componentsToBeUpdated[component] = []*models.Cell{cell}
			}

			newEvents = append(newEvents, models.NewUpdateComponentActivityEvent(component))
		}
	}

	for cmp, wallsToBeRemoved := range componentsToBeUpdated {
		updatedWalls := make([]*models.Cell, 0)
		for _, w := range cmp.Walls {
			found := false
			for _, wallToBeRemoved := range wallsToBeRemoved {
				if wallToBeRemoved == w {
					found = true
					break
				}
			}

			if !found {
				updatedWalls = append(updatedWalls, w)
			}
		}

		newUpdates = append(newUpdates, models.NewComponentsUpdate(cmp.ID, models.ComponentSetRequest{
			Walls: updatedWalls,
		}))
	}

	return processResult{
		events:  newEvents,
		updates: newUpdates,
	}
}

func (store *Store) applyUpdates(updates []models.Update) {
	for _, update := range updates {
		switch casted := update.(type) {
		case models.FieldUpdate:
			store.applyFieldUpdate(&casted)
		case models.ComponentsUpdate:
			store.applyComponentsUpdate(&casted)
		case models.AddComponentUpdate:
			store.applyAddComponentUpdate(&casted)
		case models.RemoveComponentUpdate:
			store.applyRemoveComponentUpdate(&casted)
		}
	}

	if len(updates) > 0 {
		for _, sub := range store.subscribtions {
			sub()
		}
	}
}

func (store *Store) applyFieldUpdate(update *models.FieldUpdate) {
	log.Printf("events: update: field: %v", update)
	page := store.field.Get(update.Crd.Page)
	if page != nil {
		page.Set(update.Crd, update.Request)
	}
}

func (store *Store) applyComponentsUpdate(update *models.ComponentsUpdate) {
	if update == nil {
		return
	}

	component, ok := store.components.Get(update.ID)
	if !ok {
		return
	}

	log.Printf("events: update: component: %v", update)

	if update.Request.Walls != nil {
		component.Walls = update.Request.Walls
	}
	if update.Request.IsActive != nil {
		component.IsActive = *update.Request.IsActive
	}
}

func (store *Store) applyAddComponentUpdate(update *models.AddComponentUpdate) {
	_, ok := store.components.Get(update.Component.ID)
	if ok {
		return
	}

	log.Printf("events: update: add component: %v", update)

	store.components.Set(update.Component)
}

func (store *Store) applyRemoveComponentUpdate(update *models.RemoveComponentUpdate) {
	log.Printf("events: update: remove component: %v", update)
	store.components.Delete(update.ID)
}
