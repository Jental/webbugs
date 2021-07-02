package mappers

import (
	"webbugs-common/contracts"
	"webbugs-common/models"
)

func MapFromMultiField(field *models.Field) contracts.MultiFieldContract {
	grid := make(map[int64]contracts.FieldContract)
	grid[0] = MapFromField(field)

	crds := make([]contracts.CoordinatesContract, 1)
	crds[0] = contracts.CoordinatesContract{
		X: 0,
		Y: 0,
		Z: 0,
	}

	return contracts.MultiFieldContract{
		PageRadius:  1,
		Grid:        grid,
		Coordinates: crds,
	}
}

func MapToMultiField(field *contracts.MultiFieldContract) (*models.Field, error) {
	page := field.Grid[0]
	return MapToField(&page)
}

func MapFromData(field *models.Field, components *models.Components) contracts.DataContract {
	return contracts.DataContract{
		Field:      MapFromMultiField(field),
		Components: MapFromComponents(components),
	}
}

func MapToData(data *contracts.DataContract) (*models.Field, *models.Components, error) {
	field, err := MapToMultiField(&data.Field)
	if err != nil {
		return nil, nil, err
	}

	components, err := MapToComponents(data.Components, field)
	if err != nil {
		return nil, nil, err
	}

	components.Range(func(id uint, component *models.Component) bool {
		for _, cell := range component.Walls {
			cell.Component = component
		}
		return true
	})

	return field, components, nil
}
