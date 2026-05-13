import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Ticket } from 'lucide-react';

interface EventRow {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  cover_image: string | null;
  ticket_url: string | null;
}

const UpcomingEvents: React.FC = () => {
  const [events, setEvents] = useState<EventRow[]>([]);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await (supabase as any)
        .from('events')
        .select('id,title,event_date,event_time,location,cover_image,ticket_url')
        .eq('status', 'active')
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .limit(6);
      setEvents((data as EventRow[]) ?? []);
    })();
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-3">
      <div className="flex items-center gap-2 mb-3 text-white/80">
        <Calendar className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold tracking-wide">Upcoming Events</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hidden pb-1">
        {events.map((ev) => {
          const d = new Date(ev.event_date);
          const month = d.toLocaleString('en-US', { month: 'short' });
          const day = d.getDate();
          return (
            <div
              key={ev.id}
              className="min-w-[220px] max-w-[220px] rounded-xl bg-gradient-to-br from-purple-500/15 to-blue-500/10 border border-white/10 p-3 flex flex-col gap-2"
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-white/10 text-white">
                  <span className="text-[10px] uppercase text-purple-300">{month}</span>
                  <span className="text-lg font-bold leading-none">{day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{ev.title}</div>
                  {ev.location && (
                    <div className="flex items-center gap-1 text-xs text-white/60 truncate">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  )}
                </div>
              </div>
              {ev.ticket_url && (
                <a
                  href={ev.ticket_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1 text-xs font-medium rounded-lg py-1.5 bg-purple-500/30 hover:bg-purple-500/50 text-white transition"
                >
                  <Ticket className="w-3 h-3" /> Get Tickets
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingEvents;
