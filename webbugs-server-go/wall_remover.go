package main

import (
	"time"
	"webbugs-server/models"
)

var interval time.Duration = 10 * time.Second
var duration time.Duration = 1 * time.Minute

// StartWallRemover - starts wall remove process
func (store *Store) StartWallRemover() {
	ticker := time.NewTicker(interval)

	go func() {
		for {
			<-ticker.C

			now := time.Now().UTC()

			crds := make([]models.FullCoordinates, 0)
			store.components.Range(func(key uint, c *models.Component) bool {
				for _, w := range c.Walls {
					if now.Sub(w.CreatedAt) >= duration {
						crds = append(crds, w.Crd)
					}
				}
				return true
			})

			if len(crds) > 0 {
				var newEvent models.Event = models.NewClearCellsEvent(crds)
				store.eventQueue <- &newEvent
			}
		}
	}()
}
