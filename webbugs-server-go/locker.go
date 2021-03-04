package main

import (
	"math"
	"sync"
	"webbugs-server/models"
)

const partSize = 3

var maxFieldRadiusSq = int64(math.Pow(float64(models.MaxFieldRadius), 2))
var maxFieldRadiusPow3 = int64(math.Pow(float64(models.MaxFieldRadius), 3))

// Locker - mutextes for fields
type Locker struct {
	mutexes  sync.Map
	radius   int64
	raduisSq int64
}

// NewLocker - creates new locker
func NewLocker(pageRadius uint) Locker {
	return Locker{
		radius:   int64(math.Ceil(float64(pageRadius) / partSize)),
		raduisSq: int64(math.Pow(math.Ceil(float64(pageRadius)/partSize), 2)),
	}
}

// Key - calculates keys
func (locker *Locker) Key(crd models.FullCoordinates) int64 {
	// field: return int64(p.X) + 4*MaxFieldRadius*int64(p.Y) + 16*maxFieldRadiusSq*int64(p.Z)
	// page: 	return int64(crd.X) + 4*int64(page.Radius)*int64(crd.Y) + 16*int64(math.Pow(float64(page.Radius), 2))*int64(crd.Z)

	return int64(crd.Page.X) +
		2*models.MaxFieldRadius*int64(crd.Page.Y) +
		4*maxFieldRadiusSq*int64(crd.Page.Z) +
		8*maxFieldRadiusPow3*int64(math.Floor(float64(crd.Cell.X)/3)) +
		16*maxFieldRadiusPow3*locker.radius*int64(math.Floor(float64(crd.Cell.Y)/3)) +
		32*maxFieldRadiusPow3*locker.raduisSq*int64(math.Floor(float64(crd.Cell.Z)/3))
}

// Lock - locks field part
func (locker *Locker) Lock(key int64) {
	mutex, ok := locker.mutexes.Load(key)
	if !ok {
		var newMutex sync.Mutex
		locker.mutexes.Store(key, &newMutex)
		newMutex.Lock()
	} else {
		mutex.(*sync.Mutex).Lock()
	}
}

// Unlock - unlocks field part
func (locker *Locker) Unlock(key int64) {
	mutex, ok := locker.mutexes.Load(key)
	if ok {
		mutex.(*sync.Mutex).Unlock()
	}
}

// LockForUpdates - locks multiple field parts
func (locker *Locker) LockForUpdates(updates []models.Update) []int64 {
	keys := make([]int64, 0)

	for _, update := range updates {
		switch casted := update.(type) {
		case models.FieldUpdate:
			key := locker.Key(casted.Crd)
			alreadyAdded := false
			for _, k := range keys {
				if k == key {
					alreadyAdded = true
					break
				}
			}
			if !alreadyAdded {
				keys = append(keys, key)
			}
		}
	}

	for _, key := range keys {
		locker.Lock(key)
	}

	return keys
}

// UnlockForKeys - unlocks multiple field parts
func (locker *Locker) UnlockForKeys(keys []int64) {
	for _, key := range keys {
		locker.Unlock(key)
	}
}
