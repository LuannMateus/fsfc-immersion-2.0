import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button, Grid, makeStyles, MenuItem, Select } from "@material-ui/core";
import { Loader } from "google-maps";
import { sample, shuffle } from "lodash";
import io from "socket.io-client";

import { Route } from "../../util/models";
import { getCurrentPositon } from "../../util/getLocation";
import { makeCarIcon, makeMakerIcon, Map } from "../../util/map";
import { RouteExistsError } from "../../errors/route-exists.error";
import { useSnackbar } from "notistack";
import NavBar from "../NavBar";

// * Environments vars
const API_URL = process.env.REACT_APP_API_URL as string;
const googleMapsLoader = new Loader(process.env.REACT_APP_GOOGLE_API_KEY);

const colors = [
  "#b71c1c",
  "#4a148c",
  "#2e7d32",
  "#e65100",
  "#2962ff",
  "#c2185b",
  "#FFCD00",
  "#3e2723",
  "#03a9f4",
  "#827717",
];

// * Css design
const useStyles = makeStyles({
  root: {
    height: "100vh",
    width: "100%",
  },
  form: {
    margin: "16px",
  },
  btnSubmitWrapper: {
    textAlign: "center",
    margin: "8px",
  },
  map: {
    height: "100%",
    width: "100%",
  },
});

type Props = {};

const Mapping: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeIdSelected, setRouteIdSelected] = useState<string>("");
  const mapRef = useRef<Map>();
  const socketIORef = useRef<SocketIOClient.Socket>();
  const { enqueueSnackbar } = useSnackbar();

  const finishRoute = useCallback(
    (route: Route) => {
      enqueueSnackbar(`${route.title} finished!`, {
        variant: "success",
      });

      mapRef.current?.removeRoute(route._id);
    },
    [enqueueSnackbar]
  );

  // * connection to Nest with WebSocket
  useEffect(() => {
    if (!socketIORef.current?.connected) {
      socketIORef.current = io.connect(API_URL);
      socketIORef.current.on("connect", () => console.log("Connected"));
    }

    const handler = (data: {
      routeId: string;
      position: [number, number];
      finished: boolean;
    }) => {
      // * Get and set new positions
      mapRef.current?.moveCurrentMarker(data.routeId, {
        lat: data.position[0],
        lng: data.position[1],
      });

      const route = routes.find((route) => route._id === data.routeId) as Route;

      if (data.finished) {
        finishRoute(route);
      }
    };
    socketIORef.current?.on("new-position", handler);

    return () => {
      socketIORef.current?.off("new-position", handler);
    };
  }, [finishRoute, routes, routeIdSelected]);

  // * Get routes
  useEffect(() => {
    fetch(`${API_URL}/routes`)
      .then((responseData) => responseData.json())
      .then((resposeDataJson) => setRoutes(resposeDataJson));
  }, []);

  // * Get actual position
  useEffect(() => {
    (async () => {
      const [, position] = await Promise.all([
        googleMapsLoader.load(),
        getCurrentPositon({ enableHighAccuracy: true }),
      ]);

      const divMap = document.getElementById("map") as HTMLElement;
      mapRef.current = new Map(divMap, {
        zoom: 15,
        center: position,
      });
    })();
  }, []);

  const renderRoutes = () => {
    return routes.map((route, i) => {
      return (
        <MenuItem key={i} value={route._id}>
          {route.title}
        </MenuItem>
      );
    });
  };

  // * Submit Event
  const startRoute = useCallback(
    (event: FormEvent) => {
      event.preventDefault();

      const route = routes.find((route) => route._id === routeIdSelected);

      const color = sample(shuffle(colors)) as string;

      try {
        mapRef.current?.addRoute(routeIdSelected, {
          currentMarkerOptions: {
            position: route?.startPosition,
            icon: makeCarIcon(color),
          },
          endMarkerOptions: {
            position: route?.endPosition,
            icon: makeMakerIcon(color),
          },
        });

        socketIORef.current?.emit("new-direction", {
          routeId: routeIdSelected,
        });
      } catch (error) {
        if (error instanceof RouteExistsError) {
          enqueueSnackbar(`${route?.title} alright add, waiting to finished`, {
            variant: "error",
          });
          return;
        }
        throw error;
      }
    },
    [routeIdSelected, routes, enqueueSnackbar]
  );

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} sm={3}>
        <NavBar />
        <form onSubmit={startRoute} className={classes.form}>
          <Select
            displayEmpty
            fullWidth
            value={routeIdSelected}
            onChange={(event) => setRouteIdSelected(event.target.value + "")}
          >
            <MenuItem value="">
              <em>Select a race</em>
            </MenuItem>
            {renderRoutes()}
          </Select>
          <div className={classes.btnSubmitWrapper}>
            <Button type="submit" color="primary" variant="contained">
              Start a race
            </Button>
          </div>
        </form>
      </Grid>

      <Grid item xs={12} sm={9}>
        <div id="map" className={classes.map}></div>
      </Grid>
    </Grid>
  );
};

export default Mapping;
