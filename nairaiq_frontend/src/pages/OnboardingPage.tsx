import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingSchema, OnboardingForm } from '../schemas/onboarding.schema'
import * as onboardingService from '../services/onboarding.service'
import { useNavigate } from 'react-router-dom'
import { NIGERIAN_STATES, OCCUPATIONS, INCOME_BANDS, BANKS } from '../utils/constants'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const { register, handleSubmit, watch, setValue, formState } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { fullName: '', age_range: '25-34', state: NIGERIAN_STATES[0], occupation: OCCUPATIONS[0], income_range: INCOME_BANDS[0], pays_rent: false, has_dependants: false, primary_bank: BANKS[0] }
  })

  const values = watch()

  async function submit(data: OnboardingForm) {
    setLoading(true)
    setError(null)
    try {
      await onboardingService.submitOnboarding(data)
      navigate('/generating')
    } catch (err: any) {
      setError(err?.message ?? 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-full max-w-xl bg-[var(--navyM)] p-6 rounded shadow-lg">
        <div className="mb-4">
          <div className="h-2 bg-[var(--grayXL)] rounded overflow-hidden">
            <div style={{ width: `${(step / 4) * 100}%`, transition: 'width 400ms var(--easing)' }} className="h-2 bg-[var(--teal)]"></div>
          </div>
          <div className="flex justify-between mt-3 text-sm text-[var(--gray)]">
            <div>Step {step} of 4</div>
            <div className="italic">Under 60s</div>
          </div>
        </div>

        <form onSubmit={handleSubmit(submit)}>
          {step === 1 && (
            <div className="space-y-4 slide-in-right">
              <div>
                <label className="block text-sm">Full name</label>
                <input className="w-full mt-1 p-2 rounded bg-[var(--navyL)]" {...register('fullName')} />
              </div>
              <div>
                <label className="block text-sm">Age range</label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {['18-24','25-34','35-44','45-54','55+'].map(a => (
                    <button type="button" key={a} onClick={() => setValue('age_range', a)} className={`px-3 py-2 rounded ${values.age_range===a ? 'bg-[var(--teal)] text-black':'bg-[var(--navyL)]'}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => navigate('/register')} className="px-4 py-2 rounded bg-[var(--gray)]">Cancel</button>
                <button type="button" onClick={() => setStep(2)} className="px-4 py-2 rounded bg-[var(--teal)] text-black">Continue</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 slide-in-right">
              <div>
                <label className="block text-sm">State</label>
                <select className="w-full mt-1 p-2 rounded bg-[var(--navyL)]" {...register('state')}>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm">Occupation</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {OCCUPATIONS.map(o => (
                    <button key={o} type="button" onClick={() => setValue('occupation', o)} className={`p-3 rounded ${values.occupation===o ? 'bg-[var(--teal)] text-black':'bg-[var(--navyL)]'}`}>{o}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="px-4 py-2 rounded bg-[var(--gray)]">Back</button>
                <button type="button" onClick={() => setStep(3)} className="px-4 py-2 rounded bg-[var(--teal)] text-black">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 slide-in-right">
              <div>
                <label className="block text-sm">Income band</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {INCOME_BANDS.map(i => (
                    <button key={i} type="button" onClick={() => setValue('income_range', i)} className={`p-3 rounded ${values.income_range===i ? 'bg-[var(--teal)] text-black':'bg-[var(--navyL)]'}`}>{i}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="px-4 py-2 rounded bg-[var(--gray)]">Back</button>
                <button type="button" onClick={() => setStep(4)} className="px-4 py-2 rounded bg-[var(--teal)] text-black">Continue</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 slide-in-right">
              <div>
                <label className="block text-sm">Do you pay rent?</label>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setValue('pays_rent', true)} className={`px-3 py-2 rounded ${values.pays_rent ? 'bg-[var(--teal)] text-black':'bg-[var(--navyL)]'}`}>Yes</button>
                  <button type="button" onClick={() => setValue('pays_rent', false)} className={`px-3 py-2 rounded ${!values.pays_rent ? 'bg-[var(--teal)] text-black':'bg-[var(--navyL)]'}`}>No</button>
                </div>
              </div>
              <div>
                <label className="block text-sm">Do you have dependants?</label>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setValue('has_dependants', true)} className={`px-3 py-2 rounded ${values.has_dependants ? 'bg-[var(--teal)] text-black':'bg-[var(--navyL)]'}`}>Yes</button>
                  <button type="button" onClick={() => setValue('has_dependants', false)} className={`px-3 py-2 rounded ${!values.has_dependants ? 'bg-[var(--teal)] text-black':'bg-[var(--navyL)]'}`}>No</button>
                </div>
              </div>
              <div>
                <label className="block text-sm">Primary bank</label>
                <select className="w-full mt-1 p-2 rounded bg-[var(--navyL)]" {...register('primary_bank')}>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(3)} className="px-4 py-2 rounded bg-[var(--gray)]">Back</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-[var(--teal)] text-black">Build my profile →</button>
              </div>
            </div>
          )}

        </form>

        {loading && <div className="mt-4 text-sm">Submitting...</div>}
        {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
      </div>
    </div>
  )
}
