package models

// ComponentSetRequest - struct for component set
type ComponentSetRequest struct {
	IsActive *bool
	Walls    []*Cell
}
