package main

import (
	"errors"
	"log"
	"math"
	"math/rand"
	"os"
	"sort"
	"time"
	"webbugs-server/models"

	"github.com/google/uuid"
)

const SMALL_TIMEOUT time.Duration = 50 * time.Millisecond
const BIG_TIMEOUT time.Duration = 5 * time.Second

var logger *log.Logger

func getAngle(cell0 models.Coordinates, cell1 models.Coordinates) float64 {
	dx := cell1.X - cell0.X
	dy := cell1.Y - cell0.Y
	dz := cell1.Z - cell0.Z

	dxy := dx - dy
	if dxy == 0 {
		if dz > 0 {
			return 270
		} else {
			return 90
		}
	}

	tg := -float64(dz) / float64(dxy)

	if dxy >= 0 && tg >= 0 {
		return tg * 60 // I
	} else if dxy < 0 && tg < 0 {
		return 180 + tg*60 // II
	} else if dxy < 0 && tg >= 0 {
		return 180 + tg*60 // III
	} else {
		return 360 + tg*60 // IV
	}
}

var sq3 float64 = math.Sqrt(3)

func getCellCoordinatesByAngle(cell models.Coordinates, angle float64) models.Coordinates {
	rangle := math.Pi / 180 * angle // in radians

	dx := int64(math.Round(math.Sin(rangle+math.Pi/3) * 2 / sq3))
	dy := int64(math.Round(math.Sin(rangle-math.Pi/3) * 2 / sq3))
	dz := -int64(math.Round(math.Sin(rangle) * 2 / sq3))

	// logger.Println(cell, angle, dx, dy, dz)

	return models.NewCoordinates(cell.X+dx, cell.Y+dy, cell.Z+dz)
}

func getOrt(cell0 models.Coordinates, cell1 models.Coordinates, direction bool) models.Coordinates {
	angle := getAngle(cell0, cell1)
	// logger.Println(cell0, cell1, angle)

	var ortAngle float64
	if direction {
		// right direction
		ortAngle = math.Remainder(angle-60, 360)
	} else {
		// left direction
		ortAngle = math.Remainder(angle+60, 360)
	}

	return getCellCoordinatesByAngle(cell0, ortAngle)
}

// Identifies loop direction.
// false - to left  while moving from the start point
// true  - to right while moving from the start point
func getLoopDirection(loop []*models.Cell) (bool, error) {
	if len(loop) < 4 {
		return false, errors.New("Loop is too small")
	}

	if loop[0] != loop[len(loop)-1] {
		return false, errors.New("Loop is invalid")
	}

	startAngle := getAngle(loop[0].Crd.Cell, loop[1].Crd.Cell)
	var totalDiff float64 = 0
	var totalAngleDiff float64 = 0
	var countLeft = 0
	var countRight = 0
	var lastTotalDiffBeforeZero float64 = 0
	for i, cell := range loop {
		if i == 0 || i >= len(loop)-2 {
			continue
		}

		absoluteAngle := getAngle(cell.Crd.Cell, loop[i+1].Crd.Cell)
		previousAngle := getAngle(loop[i-1].Crd.Cell, cell.Crd.Cell)
		relativeToStartAngle := math.Mod(360+absoluteAngle-startAngle, 360)
		relativeToPreviousAngle := math.Mod(360+absoluteAngle-previousAngle, 360)
		if relativeToPreviousAngle >= 180 {
			relativeToPreviousAngle = relativeToPreviousAngle - 360
		}
		rangle := math.Pi / 180 * relativeToStartAngle // in radians
		logger.Println("direction angle:", cell.Crd.Cell, loop[i+1].Crd.Cell, absoluteAngle, relativeToStartAngle, relativeToPreviousAngle)

		diff := math.Sin(rangle) / sq3 * 2
		totalDiff = totalDiff + diff
		totalAngleDiff = totalAngleDiff + relativeToPreviousAngle

		if math.Round(totalDiff) == 0 && math.Round(diff) != 0 {
			lastTotalDiffBeforeZero = totalDiff - diff
		}

		if diff < 0 {
			countRight = countRight + 1
		} else if diff > 0 {
			countLeft = countLeft + 1
		}

		logger.Println("direction diff:", diff, totalDiff, lastTotalDiffBeforeZero, totalAngleDiff)
	}

	var result0 bool
	if math.Round(totalDiff) == 0 {
		result0 = lastTotalDiffBeforeZero < 0
	} else {
		result0 = totalDiff < 0
	}

	var result1 = countLeft < countRight

	var result2 = totalAngleDiff < 0

	logger.Println("direction results:", result0, result1, result2)

	return result2, nil

	// if math.Abs(float64(countLeft)-float64(countRight)) < 5 {
	// 	return result0, errors.New("Uncertain direction result")
	// }

	// if result0 == result1 {
	// 	return result0, nil
	// } else {
	// 	return result0, errors.New("Unmatching direction results")
	// }
}

func findCellsInsideLoop(loop []*models.Cell) ([]models.Coordinates, error) {
	if loop[0] != loop[len(loop)-1] {
		return nil, errors.New("Loop is invalid")
	}

	direction, err := getLoopDirection(loop)
	if err != nil {
		return nil, err
	}

	insideCells := make([]models.Coordinates, 0)
	newCells := make([]models.Coordinates, 0)
	prevCells := make([]models.Coordinates, len(loop))
	for i, cell := range loop {
		prevCells[i] = cell.Crd.Cell
	}

	for {
		logger.Println("next inside level", prevCells)
		for i, cell := range prevCells {
			if i < len(prevCells)-1 {
				ncellCrd := getOrt(cell, prevCells[i+1], direction)
				found := false
				for _, nc := range newCells {
					if nc.X == ncellCrd.X && nc.Y == ncellCrd.Y && nc.Z == ncellCrd.Z {
						found = true
						break
					}
				}
				if !found {
					for _, nc := range insideCells {
						if nc.X == ncellCrd.X && nc.Y == ncellCrd.Y && nc.Z == ncellCrd.Z {
							found = true
							break
						}
					}
				}
				if !found {
					for _, nc := range loop {
						if nc.Crd.Cell.X == ncellCrd.X && nc.Crd.Cell.Y == ncellCrd.Y && nc.Crd.Cell.Z == ncellCrd.Z {
							found = true
							break
						}
					}
				}
				if !found {
					newCells = append(newCells, ncellCrd)
				}
			}
		}

		if len(newCells) == 0 {
			break
		} else {
			insideCells = append(insideCells, newCells...)
			prevCells = newCells
			newCells = make([]models.Coordinates, 0)
		}
	}

	return insideCells, nil
}

func (store *Store) populateLoop(loop []*models.Cell, playerID uuid.UUID) ([]models.Coordinates, error) {
	if loop[0] != loop[len(loop)-1] {
		return nil, errors.New("Loop is invalid")
	}

	allCells := make([]models.Coordinates, len(loop))
	for i, cell := range loop {
		allCells[i] = cell.Crd.Cell
	}

	for {
		newCells := make([]models.Coordinates, 0)
		for _, cell0 := range allCells {
			for _, cell1 := range allCells {
				if cell0 != cell1 && models.AreNeighbours(cell0, cell1) {
					ort0 := getOrt(cell0, cell1, true)
					ortCell0 := store.field.Get(models.NewCoordinates(0, 0, 0)).Get(ort0)
					if ortCell0 != nil && ortCell0.CellType == models.CellTypeWall && ortCell0.PlayerID == playerID {
						if !existsCrd(newCells, ort0) && !existsCrd(allCells, ort0) {
							newCells = append(newCells, ort0)
						}
					}
					ort1 := getOrt(cell0, cell1, false)
					ortCell1 := store.field.Get(models.NewCoordinates(0, 0, 0)).Get(ort1)
					if ortCell1 != nil && ortCell1.CellType == models.CellTypeWall && ortCell1.PlayerID == playerID {
						if !existsCrd(newCells, ort1) && !existsCrd(allCells, ort1) {
							newCells = append(newCells, ort1)
						}
					}
				}
			}
		}

		if len(newCells) == 0 {
			break
		}

		logger.Println("populate: new cells:", newCells)
		allCells = append(allCells, newCells...)
	}

	return allCells, nil
}

func (store *Store) findNextLoopStart(component *models.Component, page *models.Page) *models.Cell {
	wallsWithOtherNeighbours := make([]*models.Cell, 0)
	for _, wall := range component.Walls {
		neighbours := page.GetNeibhours(wall.Crd.Cell)

		otherNeighboursPresent := false
		for _, n := range neighbours {
			// if n == nil {
			// 	logger.Println("findNextLoopStart: nil neighbour")
			// } else {
			// 	logger.Printf("findNextLoopStart: neighbour [%v]: %v %v", wall.Crd.Cell, n.CellType, n.PlayerID)
			// }
			if n == nil ||
				n.CellType == models.CellTypeBug ||
				(n.CellType == models.CellTypeWall && n.PlayerID != wall.PlayerID) {
				otherNeighboursPresent = true
				break
			}
		}

		if otherNeighboursPresent {
			wallsWithOtherNeighbours = append(wallsWithOtherNeighbours, wall)
		}
	}

	if len(wallsWithOtherNeighbours) == 0 {
		return nil
	}

	wallIdx := int(rand.Int31n(int32(len(wallsWithOtherNeighbours))))
	wall := wallsWithOtherNeighbours[wallIdx]

	return wall
}

func processComponent(component *models.Component, page *models.Page) bool {
	start := store.findNextLoopStart(component, page)
	// var start *models.Cell = store.field.Get(models.NewCoordinates(0, 0, 0)).Get(models.NewCoordinates(0, 2, -2)) // circle_wall_1.json
	//var start *models.Cell = store.field.Get(models.NewCoordinates(0, 0, 0)).Get(models.NewCoordinates(8, -9, 1)) // circle_wall_0.json
	//var start *models.Cell = store.field.Get(models.NewCoordinates(0, 0, 0)).Get(models.NewCoordinates(-1, -4, 5)) // circle_wall_right_0.json
	// var start *models.Cell = store.field.Get(models.NewCoordinates(0, 0, 0)).Get(models.NewCoordinates(5, -7, 2)) // circle_wall_right_1.json
	// var start *models.Cell = store.field.Get(models.NewCoordinates(0, 0, 0)).Get(models.NewCoordinates(5, 0, -5)) // circle_wall_1.json
	// var start *models.Cell = store.field.Get(models.NewCoordinates(0, 0, 0)).Get(models.NewCoordinates(3, -2, -1)) // circle_wall_1.json
	// var start *models.Cell = store.field.Get(models.NewCoordinates(0, 0, 0)).Get(models.NewCoordinates(4, -1, -3)) // circle_wall_2.json
	if start == nil {
		logger.Println("loop start not found")
		return false
	}
	logger.Println("loop start:", *start)

	loop, found := store.findWallLoop(start.PlayerID, start)
	if !found {
		logger.Println("loop not found")
		return false
	}

	logger.Println("loop:")
	for _, c := range loop {
		logger.Println(c.Crd.Cell)
	}

	direction, err := getLoopDirection(loop)
	if err != nil {
		logger.Println("failed to get loop direction", err)
		return false
	}

	if direction {
		logger.Println("right loop")
	} else {
		logger.Println("left loop")
	}

	// populated, err := store.populateLoop(loop, start.PlayerID)
	// if err != nil {
	// 	logger.Println("populate err:", err)
	// } else {
	// 	logger.Println("populated:")
	// 	for _, crd := range populated {
	// 		logger.Println(crd)
	// 	}
	// }

	insideCells, err := findCellsInsideLoop(loop)
	if err != nil {
		logger.Println("failed to find inside cells", err)
		return false
	}

	for _, crd := range insideCells {
		cell := page.Get(crd)
		if cell == nil || cell.CellType != models.CellTypeWall || cell.PlayerID != start.PlayerID {
			logger.Println("inside cell:", crd)

			var event models.Event = models.NewSetWallEvent(
				models.FullCoordinates{
					Page: models.NewCoordinates(0, 0, 0),
					Cell: crd,
				},
				start.PlayerID)
			store.Handle(&event)
		}
	}

	return true
}

func (store *Store) startRemovingImmortals() {
	f, err := os.OpenFile("logs/immortals.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error opening file: %v", err)
	}
	defer f.Close()
	logger = log.New(f, "", os.O_RDWR|os.O_CREATE|os.O_APPEND)

	page := store.field.Get(models.NewCoordinates(0, 0, 0))

	for {
		if store.components.Len() == 0 {
			logger.Println("no components")
			time.Sleep(BIG_TIMEOUT)
			continue
		}

		bigComponents := make([]*models.Component, 0)
		store.components.Range(func(key uint, cmp *models.Component) bool {
			// logger.Println("wall count", cID, len(cmp.Walls))
			if len(cmp.Walls) >= 10 {
				bigComponents = append(bigComponents, cmp)
			}
			return true
		})
		if len(bigComponents) == 0 {
			logger.Println("no big components found")
			time.Sleep(BIG_TIMEOUT)
			continue
		}

		immortalsWereFound := false
		for _, component := range bigComponents {
			f := processComponent(component, page)
			immortalsWereFound = immortalsWereFound || f
			logger.Println("immortals found: ", component.ID, f)
		}

		if immortalsWereFound {
			time.Sleep(SMALL_TIMEOUT)
		} else {
			time.Sleep(BIG_TIMEOUT)
		}
	}
}

func exists(list []*models.Cell, element *models.Cell) bool {
	for _, el := range list {
		if el == element {
			return true
		}
	}

	return false
}
func existsCrd(list []models.Coordinates, element models.Coordinates) bool {
	for _, el := range list {
		if el == element {
			return true
		}
	}

	return false
}

func except(list0 []*models.Cell, list1 []*models.Cell) []*models.Cell {
	result := make([]*models.Cell, 0)

	for _, el := range list0 {
		if !exists(list1, el) {
			result = append(result, el)
		}
	}

	return result
}

func (store *Store) findWallLoop(playerID uuid.UUID, startCell *models.Cell) ([]*models.Cell, bool) {
	return findWallLoopRec(store, playerID, startCell, nil, make([]*models.Cell, 0), make([]*models.Cell, 0))
}

func findWallLoopRec(
	store *Store,
	playerID uuid.UUID,
	currentCell *models.Cell,
	previousCell *models.Cell,
	currentPath []*models.Cell,
	visitedCells []*models.Cell,
) ([]*models.Cell, bool) {

	logger.Println("findWallLoopRec: cell:", currentCell.Crd.Cell)
	newPath := append(currentPath, currentCell)

	page := store.field.Get0()
	if page == nil {
		return currentPath, false
	}

	wallNeghbours := page.GetOwnWallNeibhours(currentCell.Crd.Cell, playerID)
	// End of a wall line. Loop is not found.
	if len(wallNeghbours) == 0 {
		return currentPath, false
	}

	logger.Println("wallNeghbours:")
	var foundLoopEnd *models.Cell = nil
	for _, n := range wallNeghbours {
		log.Print(n.Crd.Cell)
		for _, c := range currentPath {
			if n != previousCell && c != previousCell && n == c {
				if len(currentPath) > 1 && n != currentPath[len(currentPath)-2] {
					foundLoopEnd = n
				}
			}
		}
	}
	if foundLoopEnd != nil {
		logger.Println("found loop")
		pathWithoutHead := make([]*models.Cell, 0)
		startFound := false
		for _, cell := range newPath {
			startFound = startFound || foundLoopEnd == cell
			if startFound {
				pathWithoutHead = append(pathWithoutHead, cell)
			}
		}
		return append(pathWithoutHead, foundLoopEnd), true
	}

	filteredWallNeighbours := make([]*models.Cell, 0)
	for _, n := range wallNeghbours {
		wallNeighboursOfNeighbour := page.GetOwnWallNeibhours(n.Crd.Cell, playerID)

		// We are interested only in walls not surrounded by other own walls.
		// And which have other neighbour walls except previous ones.
		if len(wallNeighboursOfNeighbour) < 6 && len(wallNeighboursOfNeighbour) > 1 {
			if !exists(visitedCells, n) {
				filteredWallNeighbours = append(filteredWallNeighbours, n)
			}
		}
	}

	// Nos suitable wall line ontinuation found. Loop is not found.
	if len(filteredWallNeighbours) == 0 {
		return currentPath, false
	}

	var currentAngle float64
	if previousCell == nil {
		currentAngle = 0
	} else {
		currentAngle = getAngle(currentCell.Crd.Cell, previousCell.Crd.Cell)
	}
	logger.Println("currentAngle:", currentAngle)

	// We are going to get wall with angle closest to the one we came.
	// So we need to sort walls.
	sort.SliceStable(filteredWallNeighbours, func(i, j int) bool {
		firstAngle := getAngle(currentCell.Crd.Cell, filteredWallNeighbours[i].Crd.Cell)
		secondAngle := getAngle(currentCell.Crd.Cell, filteredWallNeighbours[j].Crd.Cell)
		return math.Mod(360+firstAngle-currentAngle, 360) < math.Mod(360+secondAngle-currentAngle, 360)
	})

	logger.Println("filteredWallNeighbours:")
	for _, n := range filteredWallNeighbours {
		angle := getAngle(currentCell.Crd.Cell, n.Crd.Cell)
		diff0 := 360 + angle - currentAngle
		diff := math.Mod(diff0, 360)
		log.Print(n.Crd.Cell, angle, currentAngle, diff0, diff)
	}

	newVisitedCells := append(visitedCells, currentCell)

	for _, n := range filteredWallNeighbours {
		result, found := findWallLoopRec(store, playerID, n, currentCell, newPath, newVisitedCells)
		if found {
			return result, true
		}
	}

	return newPath, false
}
