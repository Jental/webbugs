package models

import "github.com/google/uuid"

// CellSetRequest - struct for on cell
type CellSetRequest struct {
	CellType  *CellType
	PlayerID  uuid.UUID
	Component *Component
	IsBase    *bool
}
