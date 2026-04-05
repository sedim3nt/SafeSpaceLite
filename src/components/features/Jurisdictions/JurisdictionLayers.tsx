import { Card } from '../../common';
import type {
  JurisdictionLayer,
  JurisdictionLayerKind,
} from '../../../data/jurisdictions';

const LAYER_STYLES: Record<
  JurisdictionLayerKind,
  { label: string; badge: string; border: string }
> = {
  city: {
    label: 'City',
    badge: 'bg-sage-100 text-sage-800',
    border: 'border-sage-200',
  },
  county: {
    label: 'County',
    badge: 'bg-bamboo-100 text-bamboo-800',
    border: 'border-bamboo-200',
  },
  state: {
    label: 'State',
    badge: 'bg-blue-100 text-blue-800',
    border: 'border-blue-200',
  },
  federal: {
    label: 'Federal',
    badge: 'bg-violet-100 text-violet-800',
    border: 'border-violet-200',
  },
};

interface JurisdictionLayersProps {
  layers: JurisdictionLayer[];
  title?: string;
  subtitle?: string;
  omitKinds?: JurisdictionLayerKind[];
}

export function JurisdictionLayers({
  layers,
  title = 'Jurisdiction Layers',
  subtitle = 'SafeSpace resolves each address into the local, county, state, and federal rules that shape your housing rights.',
  omitKinds = [],
}: JurisdictionLayersProps) {
  const visibleLayers = layers.filter((layer) => !omitKinds.includes(layer.kind));

  if (visibleLayers.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-text">{title}</h3>
        <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleLayers.map((layer) => {
          const style = LAYER_STYLES[layer.kind];

          return (
            <Card key={`${layer.kind}-${layer.slug}`} className={`space-y-4 ${style.border}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-text">{layer.name}</h4>
                  <p className="mt-1 text-sm text-text-muted">{layer.summary}</p>
                </div>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-sm font-semibold ${style.badge}`}>
                  {style.label}
                </span>
              </div>

              {layer.laws.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-text">Key rules</p>
                  <div className="space-y-3">
                    {layer.laws.slice(0, 4).map((law) => (
                      <div key={`${law.name}-${law.citation}`} className="rounded-lg bg-surface-muted p-3">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium text-text">{law.name}</p>
                          <p className="text-sm text-text-muted">{law.citation}</p>
                        </div>
                        <p className="mt-2 text-sm text-text-muted">{law.summary}</p>
                        {law.url && (
                          <a
                            className="mt-2 inline-flex text-sm font-medium text-sage-700 hover:underline"
                            href={law.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Official source
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {layer.resources.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-text">Resources</p>
                  <div className="space-y-2">
                    {layer.resources.slice(0, 3).map((resource) => (
                      <div key={resource.name} className="rounded-lg border border-border p-3">
                        <p className="text-sm font-medium text-text">{resource.name}</p>
                        <p className="mt-1 text-sm text-text-muted">{resource.description}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm">
                          {resource.phone && (
                            <a className="text-sage-700 hover:underline" href={`tel:${resource.phone.replace(/\D/g, '')}`}>
                              {resource.phone}
                            </a>
                          )}
                          {resource.url && (
                            <a className="text-sage-700 hover:underline" href={resource.url} target="_blank" rel="noreferrer">
                              Visit resource
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {layer.notes && layer.notes.length > 0 && (
                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  {layer.notes.map((note) => (
                    <p key={note}>{note}</p>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
