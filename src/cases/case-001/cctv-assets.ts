/**
 * Canonical CCTV Assets for Case 001: The Missing Girl
 *
 * Provisional canonical master: MAKE_A_CCTV_FOOTAGE_gwr_video_mvp.mp4
 * Centralized reference so master can be cleanly swapped without touching evidence logic.
 */

export const CCTV_ARDENT_001_ASSET = {
  id: 'CCTV-ARDENT-001',
  evidenceId: 'EVID-CCTV-ARDENT-001',
  title: 'Service Corridor CCTV',
  subtitle: 'Ardent Corporate Surveillance Archive',
  fileName: 'CAM-04_CORRIDOR.mp4',
  videoSrc: '/assets/video/cctv/CCTV-ARDENT-001_service-corridor.mp4',
  durationSec: 10.0,
  totalFrames: 240,
  fps: 24,
  aspectRatio: '16/9',
  location: 'Floor 14 East Service Corridor',
  camera: 'CAM-04-F14 (Ardent DVR-02)',
  timestamp: '11:18 PM',
  frames: [
    '/assets/video/cctv/frames/cctv_frame_01.jpg',
    '/assets/video/cctv/frames/cctv_frame_02.jpg',
    '/assets/video/cctv/frames/cctv_frame_03.jpg',
    '/assets/video/cctv/frames/cctv_frame_04.jpg',
  ],
};
