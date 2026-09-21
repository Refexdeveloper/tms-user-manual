import TravelModeCards from './TravelModeCards'

export default function ModeSelector({ onSelect, selected }) {
  return (
    <TravelModeCards
      title="What are you travelling by?"
      subtitle={null}
      onSelect={onSelect}
      selected={selected}
    />
  )
}
