package mappers

import (
	"errors"
	"fmt"
	"webbugs-common/contracts"
	"webbugs-common/models"
)

func MapFromComponents(components *models.Components) map[uint]contracts.ComponentContract {
	result := make(map[uint]contracts.ComponentContract, components.Len())

	components.Range(func(i uint, c *models.Component) bool {
		result[i] = MapFromComponent(c)
		return true
	})

	return result
}

func MapToComponents(components map[uint]contracts.ComponentContract, field *models.Field) (*models.Components, error) {
	var result models.Components

	for id, component := range components {
		mapped, err := MapToComponent(&component, field)
		if err != nil {
			err2 := fmt.Sprintf("Failed to map to components. Failed to map component '%d'. > %s", id, err.Error())
			return nil, errors.New(err2)
		}
		result.Set(mapped)
	}

	return &result, nil
}
