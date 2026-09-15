import { Backpack, CalendarDays, CloudSun, Compass, MapPin, Shirt, WashingMachine } from 'lucide-react';
import type { TripData } from '@/lib/types';

export function TripSummary({ trip }: { trip: TripData }) {
  const chips: Array<{ icon: typeof MapPin; label: string }> = [
    { icon: MapPin, label: trip.destination },
    { icon: CalendarDays, label: `${trip.days} ${trip.days === 1 ? 'day' : 'days'}` },
    { icon: Compass, label: trip.tripType },
    { icon: CloudSun, label: trip.climate },
    { icon: Backpack, label: trip.luggage },
    { icon: WashingMachine, label: trip.laundry },
    { icon: Shirt, label: trip.packingStyle },
  ];

  if (trip.activities.length > 0) {
    chips.push({
      icon: Compass,
      label: `${trip.activities.length} ${trip.activities.length === 1 ? 'activity' : 'activities'}`,
    });
  }

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Trip details">
      {chips.map(({ icon: Icon, label }) => (
        <li key={label} className="ps-chip">
          <Icon className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
          <span className="max-w-[16rem] truncate">{label}</span>
        </li>
      ))}
    </ul>
  );
}
