# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-17

### Added
- **Friday Support**: Added Friday (שישי) to the weekly schedule editor
  - Updated `DAYS` array in `ScheduleEditor.jsx` to include Friday
  - Adjusted grid layout to `xl:grid-cols-6` to accommodate 6 days on large screens
- **Reset Points Button**: Relocated "Reset Points" functionality from Admin Dashboard to Schedule Editor
  - Added confirmation dialog (click twice to confirm)
  - Integrated score recalculation with date selection
- **Score Recalculation**: Enhanced `storage.js` with `recalculateScore()` function
  - Allows resetting scores from a specific start date
  - Recalculates total score based on verified lessons

### Changed
- Updated `ScheduleEditor.jsx` with improved save functionality
  - Manual save required (no auto-save)
  - Clear "unsaved changes" indicator
- Enhanced `ScoringControl.jsx` with new styling and animations

### Documentation
- Updated `LINKS.md` with latest deployment information

### Deployment
- Deployed to production at [netta.surge.sh](https://netta.surge.sh)

## [0.0.0] - Initial Release
- Basic schedule tracking and rating system
- Student and teacher interfaces
- Weekly template management
