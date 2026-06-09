import { LockScreen } from "./components/os/LockScreen";
import { BootScreen } from "./components/os/BootScreen";
import { Desktop } from "./components/os/Desktop";
import { useOS } from "./store/os";
import "./index.css";
function App() {
  const user = useOS((s) => s.user);
  const booted = useOS((s) => s.booted);

  return (
    <>
      {!user && <LockScreen />}

      {user && !booted && <BootScreen />}

      {user && booted && <Desktop />}
    </>
  );
}

export default App;
