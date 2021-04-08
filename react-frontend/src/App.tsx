import { CssBaseline, MuiThemeProvider } from "@material-ui/core";
import { SnackbarProvider } from "notistack";
import Mapping from "./components/Mapping";

import Theme from "./theme";

function App() {
  return (
    <MuiThemeProvider theme={Theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <div className="App">
          <Mapping />
        </div>
      </SnackbarProvider>
    </MuiThemeProvider>
  );
}

export default App;
