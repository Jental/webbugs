package contracts

import "github.com/google/uuid"

// MetadataContract - contract for metadata messages
type MetadataContract struct {
	PlayerID  uuid.UUID   `json:"playerID"`
	PlayerIDs []uuid.UUID `json:"playerIDs"`
}
