import { ReviewForm } from '../components/features/RentalReview/ReviewForm';

export function ReviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">Rate Your Rental Experience</h1>
        <p className="mt-2 text-lg text-text-muted">
          Help future tenants by rating your landlord across 7 categories. Takes under 90 seconds.
        </p>
      </div>
      <ReviewForm />
    </div>
  );
}
