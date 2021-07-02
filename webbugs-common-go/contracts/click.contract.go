package contracts

import "github.com/google/uuid"

// ClickContract - contract for click
type ClickContract struct {
	Crd      FullCoordinatesContract `json:"p"`
	PlayerID uuid.UUID               `json:"playerID"`
}
