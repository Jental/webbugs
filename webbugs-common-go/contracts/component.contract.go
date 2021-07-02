package contracts

// ComponentContract - contract for models.Component
type ComponentContract struct {
	ID       string                    `json:"id"`
	IsActive bool                      `json:"isActive"`
	WallIDs  []FullCoordinatesContract `json:"wall_ids"`
}
