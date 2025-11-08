/**
 * Application Constants
 *
 * This file contains all predefined values used throughout the application.
 * These values are defined at compile time and provide a single source of truth.
 */

// ============================================================================
// CARD DIMENSIONS
// ============================================================================

export const CARD_WIDTH = 200
export const CARD_HEIGHT = 120

// ============================================================================
// GRID SETTINGS
// ============================================================================

export const GRID_SPACING = 20
export const GRID_DOT_RADIUS = 1
export const GRID_DOT_COLOR = '#e0e0e0'

// ============================================================================
// VIEWPORT SETTINGS
// ============================================================================

export const VIEWPORT_DEFAULT_WIDTH = 800
export const VIEWPORT_DEFAULT_HEIGHT = 600
export const VIEWPORT_INITIAL_X = 0
export const VIEWPORT_INITIAL_Y = 0
export const VIEWPORT_INITIAL_SCALE = 1.0
export const VIEWPORT_SCALE_MIN = 0.1
export const VIEWPORT_SCALE_MAX = 10.0
export const VIEWPORT_ZOOM_FACTOR = 1.05

// ============================================================================
// CARD LAYOUT - TASK CARD
// ============================================================================

export const TASK_CARD = {
    // Text positioning
    TITLE_X: 10,
    TITLE_Y: 15,
    TITLE_WIDTH_PADDING: 20, // Subtract from card width
    TITLE_FONT_SIZE: 16,

    // Description
    DESCRIPTION_TOP: 45,
    DESCRIPTION_X: 10,
    DESCRIPTION_WIDTH_PADDING: 20,
    DESCRIPTION_FONT_SIZE: 12,

    // Footer
    FOOTER_RESERVED_HEIGHT: 40,
    DATE_Y_OFFSET: 30, // From bottom
    DATE_FONT_SIZE: 11,
    PRIORITY_Y_OFFSET: 15, // From bottom
    PRIORITY_FONT_SIZE: 11,

    // Priority indicator bar
    PRIORITY_BAR_HEIGHT: 4,
    PRIORITY_BAR_CORNER_RADIUS: [4, 4, 0, 0] as [
        number,
        number,
        number,
        number,
    ],

    // Card styling
    CORNER_RADIUS: 10,
    STROKE_WIDTH_NORMAL: 2,
    STROKE_WIDTH_SELECTED: 3,

    // Shadows
    SHADOW_OFFSET_X: 2,
    SHADOW_OFFSET_Y: 2,
    SHADOW_BLUR_NORMAL: 5,
    SHADOW_BLUR_SELECTED: 10,
    SHADOW_BLUR_DRAGGING: 15,
    SHADOW_OPACITY_NORMAL: 0.2,
    SHADOW_OPACITY_SELECTED: 0.3,
    SHADOW_OPACITY_DRAGGING: 0.4,

    // Buttons
    BUTTON_SIZE: 24,
    BUTTON_FONT_SIZE: 16,
    BUTTON_Y: 5,
    DELETE_BUTTON_X_OFFSET: 30, // From right edge
    DUPLICATE_BUTTON_X_OFFSET: 60, // From right edge

    // Link handle
    LINK_HANDLE_SIZE: 24,
    LINK_HANDLE_X_OFFSET: 15, // From right edge
    LINK_HANDLE_Y_CENTER_OFFSET: 12,
    LINK_HANDLE_CORNER_RADIUS: 12,
}

// ============================================================================
// CARD LAYOUT - STATE CARD
// ============================================================================

export const STATE_CARD = {
    // Description
    DESCRIPTION_X: 10,
    DESCRIPTION_Y: 15,
    DESCRIPTION_WIDTH_PADDING: 20,
    DESCRIPTION_HEIGHT: 60,
    DESCRIPTION_FONT_SIZE: 13,

    // Footer
    DATE_Y_OFFSET: 35, // From bottom
    DATE_FONT_SIZE: 11,
    PRIORITY_Y_OFFSET: 20, // From bottom
    PRIORITY_FONT_SIZE: 11,

    // Priority indicator bar
    PRIORITY_BAR_HEIGHT: 4,
    PRIORITY_BAR_CORNER_RADIUS: 0,

    // Card styling
    CORNER_RADIUS: 0,
    STROKE_WIDTH_NORMAL: 2,
    STROKE_WIDTH_SELECTED: 3,

    // Shadows (same as task)
    SHADOW_OFFSET_X: 2,
    SHADOW_OFFSET_Y: 2,
    SHADOW_BLUR_NORMAL: 5,
    SHADOW_BLUR_SELECTED: 10,
    SHADOW_BLUR_DRAGGING: 15,
    SHADOW_OPACITY_NORMAL: 0.2,
    SHADOW_OPACITY_SELECTED: 0.3,
    SHADOW_OPACITY_DRAGGING: 0.4,

    // Buttons
    BUTTON_SIZE: 24,
    BUTTON_FONT_SIZE: 16,
    BUTTON_Y: 5,
    DELETE_BUTTON_X_OFFSET: 30, // From right edge
    FORK_BUTTON_X_OFFSET: 60, // From right edge
    DUPLICATE_BUTTON_X_OFFSET: 90, // From right edge
}

// ============================================================================
// SNAP PREVIEW
// ============================================================================

export const SNAP_PREVIEW = {
    STROKE_WIDTH: 2,
    DASH_PATTERN: [5, 5] as [number, number],
    CORNER_RADIUS_TASK: 4,
    CORNER_RADIUS_STATE: 0,
}

// ============================================================================
// LINK SETTINGS
// ============================================================================

export const LINK = {
    // Stroke
    STROKE_WIDTH_NORMAL: 2,
    STROKE_WIDTH_SELECTED: 3,
    HIT_STROKE_WIDTH: 20,

    // Arrow
    POINTER_LENGTH: 10,
    POINTER_WIDTH: 10,

    // Control buttons
    CONTROL_BUTTON_WIDTH: 80,
    CONTROL_BUTTON_HEIGHT: 24,
    STYLE_TOGGLE_X_OFFSET: -40,
    STYLE_TOGGLE_Y_OFFSET: -36,
    ROUTE_AROUND_X_OFFSET: -40,
    ROUTE_AROUND_Y_OFFSET: -8,
    STYLE_TOGGLE_FONT_SIZE: 12,
    ROUTE_AROUND_FONT_SIZE: 11,

    // Routing
    OBSTACLE_PADDING: 20,
    ROUTE_ABOVE_BELOW_OFFSET: 10,
    CLEARANCE_OFFSET_SMALL: 5,
    CLEARANCE_OFFSET_LARGE: 10,
    FAR_RIGHT_OFFSET: 10,
    AROUND_OBSTACLE_OFFSET: 10,
    DIRECT_PATH_THRESHOLD: 60,
}

// ============================================================================
// OFFSETS AND INCREMENTS
// ============================================================================

export const OFFSETS = {
    // Duplication
    DUPLICATE_X: 40,
    DUPLICATE_Y: 40,

    // Link creation (state from task)
    LINK_STATE_CREATION_X: 240,
    LINK_STATE_CREATION_Y: 0,
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULTS = {
    // Task defaults
    TASK_TITLE: 'New Task',
    TASK_DESCRIPTION: '',
    TASK_DATE: '',
    TASK_PRIORITY: 'Medium' as 'Low' | 'Medium' | 'High',

    // State defaults
    STATE_DESCRIPTION: 'New State',
    STATE_DATE: '',
    STATE_PRIORITY: 'Medium' as 'Low' | 'Medium' | 'High',

    // Link defaults
    LINK_STYLE: 'free' as 'free' | 'orthogonal',
    LINK_ROUTE_AROUND: false,
}

// ============================================================================
// COLORS - HARD-CODED (organized for reference)
// ============================================================================

export const COLORS = {
    // Priority colors
    PRIORITY_HIGH: '#ef4444',
    PRIORITY_MEDIUM: '#f59e0b',
    PRIORITY_LOW: '#10b981',
    PRIORITY_DEFAULT: '#6b7280',

    // Task card
    TASK_BG_NORMAL: '#ffffff',
    TASK_BG_DRAGGING: '#e3f2fd',
    TASK_BORDER_SELECTED: '#2196f3',
    TASK_BORDER_DRAGGING: '#2196f3',
    TASK_BORDER_NORMAL: '#cccccc',
    TASK_PRIORITY_BAR: '#10b981',

    // State card
    STATE_BG_NORMAL: '#faf5ff',
    STATE_BG_DRAGGING: '#f3e8ff',
    STATE_BORDER_SELECTED: '#8b5cf6',
    STATE_BORDER_DRAGGING: '#8b5cf6',
    STATE_BORDER_NORMAL: '#d8b4fe',
    STATE_PRIORITY_BAR: '#eab308',

    // Text colors
    TEXT_TITLE: '#1f2937',
    TEXT_DESCRIPTION: '#6b7280',
    TEXT_DATE: '#4b5563',
    TEXT_WHITE: 'white',

    // Buttons
    BUTTON_DELETE: '#ef4444',
    BUTTON_DUPLICATE_TASK: '#3b82f6',
    BUTTON_DUPLICATE_STATE: '#8b5cf6',
    BUTTON_FORK: '#10b981',
    BUTTON_LINK: '#10b981',

    // Snap preview
    SNAP_PREVIEW_TASK_FILL: 'rgba(100, 149, 237, 0.3)',
    SNAP_PREVIEW_TASK_STROKE: 'rgba(100, 149, 237, 0.8)',
    SNAP_PREVIEW_STATE_FILL: 'rgba(139, 92, 246, 0.3)',
    SNAP_PREVIEW_STATE_STROKE: 'rgba(139, 92, 246, 0.8)',

    // Links
    LINK_SELECTED: '#2196f3',
    LINK_NORMAL: '#6b7280',
    LINK_STYLE_BUTTON: '#8b5cf6',
    LINK_ROUTE_AROUND_ACTIVE: '#10b981',
    LINK_ROUTE_AROUND_INACTIVE: '#6b7280',

    // Shadow
    SHADOW_COLOR: 'black',
}

// ============================================================================
// TEXT CONSTANTS
// ============================================================================

export const TEXT = {
    FONT_FAMILY: 'Arial',
    ALIGN_CENTER: 'center' as const,
    VERTICAL_ALIGN_MIDDLE: 'middle' as const,
    WRAP_WORD: 'word' as const,

    // Priority labels
    PRIORITY_HIGH_LABEL: '🔴 High',
    PRIORITY_MEDIUM_LABEL: '🟡 Medium',
    PRIORITY_LOW_LABEL: '🟢 Low',

    // Icons
    DATE_ICON: '📅',
}

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const Z_INDEX = {
    TASKBAR: 100,
    MODAL: 1000,
    OVERLAY: 1000,
}
