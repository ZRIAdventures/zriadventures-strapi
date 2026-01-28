'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/group-tour-departures',
      handler: 'group-tour-departure.find',
      config: { auth: true },
    },
    {
      method: 'GET',
      path: '/group-tour-departures/:id',
      handler: 'group-tour-departure.findOne',
      config: { auth: true },
    },
    {
      method: 'POST',
      path: '/group-tour-departures',
      handler: 'group-tour-departure.create',
      config: { auth: true },
    },
    {
      method: 'PUT',
      path: '/group-tour-departures/:id',
      handler: 'group-tour-departure.update',
      config: { auth: true },
    },
    {
      method: 'DELETE',
      path: '/group-tour-departures/:id',
      handler: 'group-tour-departure.delete',
      config: { auth: true },
    },
    {
      method: 'POST',
      path: '/group-tour-departures/:id/reserve',
      handler: 'group-tour-departure.reserve',
      config: { auth: true },
    },
    {
      method: 'POST',
      path: '/group-tour-departures/:id/release',
      handler: 'group-tour-departure.release',
      config: { auth: true },
    },
  ],
};
