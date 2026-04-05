import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Input } from '../components/common';
import { getAllResearchCities, getDeepCities, getStatesWithCities, hasDeepData, type ResearchCity } from '../data/cityDatabase';

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 7 ? 'bg-green-100 text-green-800' : score >= 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      {score}/10
    </span>
  );
}

export function CitiesPage() {
  const allCities = getAllResearchCities();
  const deepCities = getDeepCities();
  const statesWithCities = useMemo(
    () => [...getStatesWithCities()].sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code)),
    [],
  );

  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [scoreFilter, setScoreFilter] = useState('');

  const filtered = useMemo(() => {
    let result = allCities;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.city.toLowerCase().includes(q));
    }
    if (stateFilter) {
      result = result.filter(c => c.state === stateFilter);
    }
    if (scoreFilter === 'strong') result = result.filter(c => c.tenantProtectionScore >= 7);
    else if (scoreFilter === 'moderate') result = result.filter(c => c.tenantProtectionScore >= 4 && c.tenantProtectionScore < 7);
    else if (scoreFilter === 'weak') result = result.filter(c => c.tenantProtectionScore < 4);
    return result;
  }, [allCities, search, stateFilter, scoreFilter]);

  // Group alphabetically by state
  const grouped = useMemo(() => {
    const map = new Map<string, ResearchCity[]>();
    for (const c of filtered) {
      const arr = map.get(c.state) || [];
      arr.push(c);
      map.set(c.state, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const deepSlugs = new Set(deepCities.map(c => c.slug));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-ink">City Search</h1>
        <p className="mt-2 text-lg text-text-muted">
          Explore researched cities, compare tenant-protection strength, and open each city&apos;s rights profile.
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-2xl">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="h-12 rounded-md border border-border bg-rice px-4 text-left text-sm text-text"
          >
            <option value="">All States & Territories</option>
            {statesWithCities.map(s => (
              <option key={s.code} value={s.code}>{s.name || s.code} ({s.count})</option>
            ))}
          </select>
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="h-12 rounded-md border border-border bg-rice px-4 text-left text-sm text-text"
          >
            <option value="">All Scores</option>
            <option value="strong">Strong (7-10)</option>
            <option value="moderate">Moderate (4-6)</option>
            <option value="weak">Weak (1-3)</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-text-muted">
        {allCities.length} researched cities across the United States. Showing {filtered.length} results.
      </p>

      {/* City List by State */}
      <div className="space-y-8">
        {grouped.map(([state, cities]) => (
          <section key={state}>
            <h2 className="text-xl font-bold text-ink mb-3 border-b border-border pb-2">{state}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cities.map(city => {
                const isDeep = deepSlugs.has(city.slug) || hasDeepData(city.slug);
                return (
                  <Link key={city.slug} to={`/city/${city.slug}`}>
                    <Card hover className="h-full !p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-ink text-sm">{city.city}</h3>
                          {city.population > 0 && (
                            <p className="text-xs text-text-muted">{city.population.toLocaleString()} pop.</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isDeep && (
                            <span className="text-xs bg-sage-100 text-sage-700 px-1.5 py-0.5 rounded-full" title="Full data available">★</span>
                          )}
                          <ScoreBadge score={city.tenantProtectionScore} />
                        </div>
                      </div>
                      {city.rentControlExists && (
                        <p className="text-xs text-sage-600 mt-1">Rent control active</p>
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {grouped.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <p>No cities match your filters.</p>
        </div>
      )}
    </div>
  );
}
