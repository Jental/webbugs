package mappers

import (
	"errors"
	"fmt"
	"strconv"
	"webbugs-common/contracts"
	"webbugs-common/models"
)

func MapFromComponent(component *models.Component) contracts.ComponentContract {
	wallIDs := make([]contracts.FullCoordinatesContract, len(component.Walls))
	for i, wall := range component.Walls {
		wallIDs[i] = contracts.FullCoordinatesContract{
			Page: contracts.CoordinatesContract{X: 0, Y: 0, Z: 0},
			Cell: MapFromCoordinates(&wall.Crd),
		}
	}
	return contracts.ComponentContract{
		ID:       strconv.Itoa(int(component.ID)),
		IsActive: component.IsActive,
		WallIDs:  wallIDs,
	}
}

func MapToComponent(component *contracts.ComponentContract, field *models.Field) (*models.Component, error) {
	walls := make([]*models.Cell, len(component.WallIDs))
	for i, wallID := range component.WallIDs {
		wallCrd := MapToCoordinates(&wallID.Cell)
		wall := field.Get(wallCrd)
		if wall == nil {
			err := fmt.Sprintf("Failed to find wall with coordinates '%v'", wallID.Cell)
			return nil, errors.New(err)
		}

		walls[i] = wall
	}

	c := models.NewComponent(component.IsActive, walls)
	return &c, nil
}
