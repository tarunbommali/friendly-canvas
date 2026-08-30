import { Navigate, useOutletContext } from 'react-router-dom'

export default function TrackPage() {
  const context = useOutletContext()
  const { currentTrackIndex = 1 } = context

  return <Navigate to={`/track/${currentTrackIndex}/post/1`} replace />
}
