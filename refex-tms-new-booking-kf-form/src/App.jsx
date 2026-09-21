import { SDKWrapper } from './sdk/wrapper.jsx'
import NewBookingForm from './booking/NewBookingForm.jsx'
import './styles.css'

export default function App() {
  return (
    <SDKWrapper>
      <NewBookingForm />
    </SDKWrapper>
  )
}
