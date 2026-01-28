'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/group-tour-departures',
      handler: 'group-tour-departure.find',
      config: { auth: { scope: [] } },
    },
    {
      method: 'GET',
      path: '/group-tour-departures/:id',
      handler: 'group-tour-departure.findOne',
      config: { auth: { scope: [] } },
    },
    {
      method: 'POST',
      path: '/group-tour-departures',
      handler: 'group-tour-departure.create',
      config: { auth: { scope: [] } },
    },
    {
      method: 'PUT',
      path: '/group-tour-departures/:id',
      handler: 'group-tour-departure.update',
      config: { auth: { scope: [] } },
    },
    {
      method: 'DELETE',
      path: '/group-tour-departures/:id',
      handler: 'group-tour-departure.delete',
      config: { auth: { scope: [] } },
    },
    {
      method: 'POST',
      path: '/group-tour-departures/:id/reserve',
      handler: 'group-tour-departure.reserve',
      config: { auth: { scope: [] } },
    },
    {
      method: 'POST',
      path: '/group-tour-departures/:id/release',
      handler: 'group-tour-departure.release',
      config: { auth: { scope: [] } },
    },
  ],
};
