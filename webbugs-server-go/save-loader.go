package main

import (
	"encoding/json"
	"log"
	"os"
	"strconv"
	"time"
	"webbugs-server/models"

	"github.com/google/uuid"
)

// ClearField - clears data in store
func ClearField(store *Store) {
	prevIsLocked := store.isLocked
	store.isLocked = true
	defer func() { store.isLocked = prevIsLocked }()

	page := store.field.Get(models.NewCoordinates(0, 0, 0))

	store.components = make(map[uint]*models.Component)
	store.players = make(map[uuid.UUID]*models.PlayerInfo)

	keys := make([]int64, 0)
	page.Grid.Range(func(key interface{}, value interface{}) bool {
		keys = append(keys, key.(int64))
		return true
	})
	for _, key := range keys {
		page.Grid.Store(key, nil)
	}
}

// LoadSave - loads a save file
func LoadSave(fileName string, store *Store) {
	prevIsLocked := store.isLocked
	store.isLocked = true
	defer func() { store.isLocked = prevIsLocked }()

	bytes, err := os.ReadFile(fileName)
	if err != nil {
		log.Fatalf("error opening file: %v", err)
		return
	}

	ClearField(store)

	var data map[string]interface{}
	json.Unmarshal(bytes, &data)

	componentsDataI, exists := data["components"]
	if !exists {
		return
	}
	componentsData := componentsDataI.(map[string]interface{})
	for key, valueI := range componentsData {
		componentIDint, err := strconv.Atoi(key)
		if err == nil {
			componentID := uint(componentIDint)
			value := valueI.(map[string]interface{})

			isActiveI, exists := value["isActive"]
			isActive := false
			if exists {
				isActive = isActiveI.(bool)
			}

			newComponent := models.Component{
				ID:       componentID,
				IsActive: isActive,
				Walls:    make([]*models.Cell, 0),
			}
			store.components[componentID] = &newComponent

			log.Printf("component: %v", newComponent)
		}
	}

	fieldDataI, exists := data["field"]
	if !exists {
		return
	}
	fieldData := fieldDataI.(map[string]interface{})

	log.Println("loaded data:")
	for key, valueI := range fieldData {
		if valueI != nil {
			value := valueI.(map[string]interface{})
			log.Printf("%v: %v", key, value)

			cellTypeI, exists := value["type"]
			if !exists {
				continue
			}
			cellTypeF := cellTypeI.(float64)
			var cellType models.CellType
			switch cellTypeF {
			case 0:
				cellType = models.CellTypeBug
			case 1:
				cellType = models.CellTypeWall
			}

			playerIDStr, exists := value["playerID"]
			if !exists {
				continue
			}
			playerID, err := uuid.Parse(playerIDStr.(string))
			if err != nil {
				log.Print(err)
				continue
			}

			fcrdi, exists := value["p"]
			if !exists {
				continue
			}
			crdi, exists := fcrdi.(map[string]interface{})["cell"]
			if !exists {
				continue
			}
			crdm := crdi.(map[string]interface{})
			crd := models.NewCoordinates(int64(crdm["x"].(float64)), int64(crdm["y"].(float64)), int64(crdm["z"].(float64)))
			fcrd := models.FullCoordinates{Page: models.NewCoordinates(0, 0, 0), Cell: crd}

			isBaseI, exists := value["isBase"]
			var isBase bool
			if !exists {
				isBase = false
			} else {
				isBase = isBaseI.(bool)
			}

			componentIDI, exists := value["component_id"]
			var component *models.Component = nil
			if exists && componentIDI != nil {
				componentIDint, err := strconv.Atoi(componentIDI.(string))
				componentID := uint(componentIDint)
				if err == nil {
					cmp, exists := store.components[componentID]
					if exists {
						component = cmp
					}
				}
			}

			page := store.field.Get(models.NewCoordinates(0, 0, 0))

			request := models.CellSetRequest{
				CellType:  &cellType,
				PlayerID:  playerID,
				Component: component,
				IsBase:    &isBase,
			}
			page.Set(fcrd, &request)

			store.players[playerID] = &models.PlayerInfo{
				ID:           playerID,
				Name:         playerID.String(),
				Client:       nil,
				LastActivity: time.Now().UTC(),
			}

			if component != nil {
				component.Walls = append(component.Walls, page.Get(crd))
			}

			log.Printf("%v", request)
		}
	}
}
