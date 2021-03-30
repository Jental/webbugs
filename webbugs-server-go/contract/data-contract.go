package contract

import (
	"strconv"
	"webbugs-server/models"
	"webbugs-server/models/components"

	"github.com/google/uuid"
)

// CoordinatesContract - contract for models.Coordinates
type CoordinatesContract struct {
	X int64 `json:"x"`
	Y int64 `json:"y"`
	Z int64 `json:"z"`
}

// FullCoordinatesContract - contract for models.FullCoordinates
type FullCoordinatesContract struct {
	Page CoordinatesContract `json:"page"`
	Cell CoordinatesContract `json:"cell"`
}

// CellContract - contract for models.Cell
type CellContract struct {
	CellType    uint                    `json:"type"`
	PlayerID    uuid.UUID               `json:"playerID"`
	ComponentID *string                 `json:"component_id"`
	P           FullCoordinatesContract `json:"p"`
	IsBase      bool                    `json:"isBase"`
}

// PageContract - contract for models.Page
type PageContract struct {
	Radius uint                    `json:"radius"`
	Grid   map[int64]*CellContract `json:"grid"`
	P      CoordinatesContract     `json:"p"`
}

// FieldContract - contract for models.Field
type FieldContract struct {
	PageRadius  uint                   `json:"pageRadius"`
	Grid        map[int64]PageContract `json:"grid"`
	Coordinates []CoordinatesContract  `json:"coordinates"`
}

// ComponentContract - contract for models.Component
type ComponentContract struct {
	ID       string                    `json:"id"`
	IsActive bool                      `json:"isActive"`
	WallIDs  []FullCoordinatesContract `json:"wall_ids"`
}

// DataContract - contract for field data
type DataContract struct {
	Field      FieldContract              `json:"field"`
	Components map[uint]ComponentContract `json:"components"`
}

func convertCoordinates(crd *models.Coordinates) CoordinatesContract {
	return CoordinatesContract{
		X: crd.X,
		Y: crd.Y,
		Z: crd.Z,
	}
}

func convertFullCoordinates(crd *models.FullCoordinates) FullCoordinatesContract {
	return FullCoordinatesContract{
		Page: convertCoordinates(&crd.Page),
		Cell: convertCoordinates(&crd.Cell),
	}
}

func convertCell(cell *models.Cell) CellContract {
	var cellType uint
	switch cell.CellType {
	case models.CellTypeBug:
		cellType = 0
	case models.CellTypeWall:
		cellType = 1
	}

	var componentID *string
	if cell.Component != nil {
		cid := strconv.Itoa(int(cell.Component.ID))
		componentID = &cid
	}

	return CellContract{
		CellType:    cellType,
		PlayerID:    cell.PlayerID,
		ComponentID: componentID,
		P:           convertFullCoordinates(&cell.Crd),
		IsBase:      cell.IsBase,
	}
}

func convertPage(page *models.Page) PageContract {
	grid := make(map[int64]*CellContract)
	page.Grid.Range(func(key interface{}, cell interface{}) bool {
		if cell != nil {
			ccell := convertCell(cell.(*models.Cell))
			grid[key.(int64)] = &ccell
		} else {
			grid[key.(int64)] = nil
		}

		return true
	})

	return PageContract{
		Radius: page.Radius,
		Grid:   grid,
		P:      convertCoordinates(&page.Crd),
	}
}

// ConvertField - converts models.Field to contract
func ConvertField(page *models.Field) FieldContract {
	grid := make(map[int64]PageContract)
	coordinates := make([]CoordinatesContract, 0)
	page.Grid.Range(func(key interface{}, page interface{}) bool {
		converted := convertPage(page.(*models.Page))
		grid[key.(int64)] = converted
		coordinates = append(coordinates, converted.P)
		return true
	})

	return FieldContract{
		PageRadius:  page.PageRadius,
		Grid:        grid,
		Coordinates: coordinates,
	}
}

// ConvertComponents - converts components to contract
func ConvertComponents(components *components.Components) map[uint]ComponentContract {
	result := make(map[uint]ComponentContract, components.Len())

	components.Range(func(i uint, c *models.Component) bool {
		wallIDs := make([]FullCoordinatesContract, len(c.Walls))
		for j, w := range c.Walls {
			if j < len(wallIDs) {
				wallIDs[j] = convertFullCoordinates(&w.Crd)
			}
		}

		result[i] = ComponentContract{
			ID:       strconv.Itoa(int(c.ID)),
			IsActive: c.IsActive,
			WallIDs:  wallIDs,
		}

		return true
	})

	return result
}
