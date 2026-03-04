const routes = [
  './routes/authRoutes',
  './routes/announcementRoutes',
  './routes/complaintRoutes',
  './routes/lostFoundRoutes',
  './routes/pollRoutes',
  './routes/reviewRoutes',
  './routes/sessionRoutes',
  './routes/skillRoutes',
  './routes/techPostRoutes',
  './routes/timetableRoutes'
];

routes.forEach((r) => {
  try {
    require(r);
    console.log(`OK: ${r}`);
  } catch (err) {
    console.error(`ERROR requiring ${r}:`, err && err.stack ? err.stack : err);
  }
});
