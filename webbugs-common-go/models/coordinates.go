package models

// Coordinates - type for 3d coordinates
type Coordinates struct {
	X int64
	Y int64
	Z int64
}

// NewCoordinates - creates new Coordinates
func NewCoordinates(x int64, y int64, z int64) Coordinates {
	return Coordinates{
		X: x,
		Y: y,
		Z: z,
	}
}
