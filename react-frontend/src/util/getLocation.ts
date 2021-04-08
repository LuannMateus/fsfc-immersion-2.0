export function getCurrentPositon(
  options?: PositionOptions
): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        return resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => reject(err),
      options
    );
  });
}
