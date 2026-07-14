interface GuideStepProps {
  title: string
  description: string
  current: number
  total: number
}

export default function GuideStep({ title, description, current, total }: GuideStepProps) {
  return (
    <>
      <h2 className="text-f24 font-semibold text-navy whitespace-pre-line tracking-[-0.5px] mb-3">
        {title}
      </h2>

      <p className="text-f16 text-navy-70 whitespace-pre-line leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex gap-2 mb-6" role="tablist" aria-label="단계 표시">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`${i + 1}단계`}
            className={[
              'h-2 rounded-full transition-all duration-300',
              i === current ? 'w-5 bg-navy' : 'w-2 bg-navy-15',
            ].join(' ')}
          />
        ))}
      </div>
    </>
  )
}
