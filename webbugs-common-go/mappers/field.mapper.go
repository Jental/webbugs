package mappers

import (
	"errors"
	"fmt"
	"sync"
	"webbugs-common/contracts"
	"webbugs-common/models"
)

func MapFromField(field *models.Field) contracts.FieldContract {
	grid := make(map[int64]*contracts.CellContract)
	field.Grid.Range(func(key interface{}, cell interface{}) bool {
		if cell != nil {
			ccell := MapFromCell(cell.(*models.Cell))
			grid[key.(int64)] = &ccell
		} else {
			grid[key.(int64)] = nil
		}

		return true
	})

	return contracts.FieldContract{
		Radius: field.Radius,
		Grid:   grid,
	}
}

func MapToField(field *contracts.FieldContract) (*models.Field, error) {
	var grid sync.Map

	for crd, cell := range field.Grid {
		if cell == nil {
			continue
		}

		cellm, err := MapToCell(cell)
		if err != nil {
			err2 := fmt.Sprintf("Failed to map to field. Failed to map cell '%d'. > %s", crd, err.Error())
			return nil, errors.New(err2)
		}
		grid.Store(crd, cellm)
	}

	result := models.Field{
		Radius: field.Radius,
		Grid:   &grid,
	}

	return &result, nil
}
