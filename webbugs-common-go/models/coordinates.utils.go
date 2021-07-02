package models

import "math"

func (crd Coordinates) IncByX() Coordinates {
	return Coordinates{
		X: crd.X,
		Y: crd.Y - 1,
		Z: crd.Z + 1,
	}
}
func (crd Coordinates) DecByX() Coordinates {
	return Coordinates{
		X: crd.X,
		Y: crd.Y + 1,
		Z: crd.Z - 1,
	}
}
func (crd Coordinates) IncByY() Coordinates {
	return Coordinates{
		X: crd.X - 1,
		Y: crd.Y,
		Z: crd.Z + 1,
	}
}
func (crd Coordinates) DecByY() Coordinates {
	return Coordinates{
		X: crd.X + 1,
		Y: crd.Y,
		Z: crd.Z - 1,
	}
}
func (crd Coordinates) IncByZ() Coordinates {
	return Coordinates{
		X: crd.X + 1,
		Y: crd.Y - 1,
		Z: crd.Z,
	}
}
func (crd Coordinates) DecByZ() Coordinates {
	return Coordinates{
		X: crd.X - 1,
		Y: crd.Y + 1,
		Z: crd.Z,
	}
}

func AreNeighbours(crd0 Coordinates, crd1 Coordinates) bool {
	return (crd0.X == crd1.X && math.Abs(float64(crd0.Y)-float64(crd1.Y)) == 1) ||
		(crd0.Y == crd1.Y && math.Abs(float64(crd0.X)-float64(crd1.X)) == 1) ||
		(crd0.Z == crd1.Z && math.Abs(float64(crd0.Y)-float64(crd1.Y)) == 1)
}
