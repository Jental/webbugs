package components

import (
	"sync"
	"webbugs-server/models"
)

type Components sync.Map

func (components *Components) Set(component *models.Component) {
	(*sync.Map)(components).Store(component.ID, component)
}

func (components *Components) Get(componentID uint) (*models.Component, bool) {
	value, exists := (*sync.Map)(components).Load(componentID)
	if value == nil {
		return nil, exists
	} else {
		return value.(*models.Component), exists
	}
}

func (components *Components) Len() uint {
	var m = (*sync.Map)(components)
	var len uint = 0
	m.Range(func(key interface{}, value interface{}) bool {
		len = len + 1
		return false
	})

	return len
}

func (components *Components) Range(f func(key uint, value *models.Component) bool) {
	var m = (*sync.Map)(components)
	m.Range(func(key, value interface{}) bool {
		return f(key.(uint), value.(*models.Component))
	})
}

func (components *Components) Delete(componentID uint) {
	var m = (*sync.Map)(components)
	m.Delete(componentID)
}
