import React from 'react'
import { Outlet, useOutletContext, useParams } from 'react-router-dom'
import NotFoundPage from '../pages/NotFoundPage'

export default function TrackLayout() {
  const context = useOutletContext()
  const { trackId } = useParams()
  const { tracks } = context

  const trackIndex = parseInt(trackId, 10)
  if (isNaN(trackIndex) || trackIndex < 1 || trackIndex > tracks.length) {
    return <NotFoundPage />
  }

  const activeTrack = tracks[trackIndex - 1]

  return (
    <div className="flex flex-col">
      <Outlet context={{ ...context, activeTrack, currentTrackIndex: trackIndex }} />
    </div>
  )
}
