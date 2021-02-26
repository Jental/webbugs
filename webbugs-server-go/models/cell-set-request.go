package models

import (
	"fmt"
	"strconv"

	"github.com/google/uuid"
)

// CellSetRequest - struct for on cell
type CellSetRequest struct {
	CellType  *CellType
	PlayerID  uuid.UUID
	Component *Component
	IsBase    *bool
}

func (request CellSetRequest) String() string {
	var cellTypeStr string
	if request.CellType == nil {
		cellTypeStr = "nil"
	} else {
		switch *request.CellType {
		case CellTypeBug:
			cellTypeStr = "bug"
		case CellTypeWall:
			cellTypeStr = "wall"
		default:
			cellTypeStr = "unknown"
		}
	}

	var componentStr string
	if request.Component == nil {
		componentStr = "nil"
	} else {
		componentStr = strconv.Itoa(int(request.Component.ID))
	}

	var isBaseStr string
	if request.IsBase == nil {
		isBaseStr = "nil"
	} else {
		if *request.IsBase {
			isBaseStr = "true"
		} else {
			isBaseStr = "false"
		}
	}

	return fmt.Sprintf("CellSetRequest:{ %v %v %v %v }", request.PlayerID, cellTypeStr, componentStr, isBaseStr)
}
