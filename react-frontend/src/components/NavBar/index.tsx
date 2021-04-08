import { AppBar, IconButton, Toolbar, Typography } from "@material-ui/core";
import DriveIcon from "@material-ui/icons/DriveEta";

type Props = {};
const NavBar: React.FunctionComponent<Props> = (props) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <DriveIcon />
        </IconButton>
        <Typography variant="h6">Code Delivery</Typography>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
