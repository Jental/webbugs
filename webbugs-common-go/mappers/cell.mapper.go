package mappers

import (
	"errors"
	"fmt"
	"webbugs-common/contracts"
	"webbugs-common/models"
)

func MapFromCell(cell *models.Cell) contracts.CellContract {
	var cellType uint
	switch cell.CellType {
	case models.CellTypeBug:
		cellType = 0
	case models.CellTypeWall:
		cellType = 1
	}

	return contracts.CellContract{
		CellType: cellType,
		PlayerID: cell.PlayerID,
		P: contracts.FullCoordinatesContract{
			Page: contracts.CoordinatesContract{X: 0, Y: 0, Z: 0},
			Cell: MapFromCoordinates(&cell.Crd),
		},
		IsBase: cell.IsBase,
	}
}

func MapToCell(contract *contracts.CellContract) (*models.Cell, error) {
	switch contract.CellType + 1 {
	case uint(models.CellTypeBug):
		cell := models.NewBugCell(contract.PlayerID, MapToCoordinates(&contract.P.Cell), contract.IsBase)
		return &cell, nil
	case uint(models.CellTypeWall):
		cell := models.NewWallCell(contract.PlayerID, MapToCoordinates(&contract.P.Cell), nil)
		return &cell, nil
	default:
		return nil, errors.New(fmt.Sprintf("Invalid cell type: %d", contract.CellType))
	}
}
