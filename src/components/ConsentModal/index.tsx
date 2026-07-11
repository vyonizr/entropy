type ConsentModalProps = {
  onAccept: () => void
  onDecline: () => void
  downloadSize: string
}

export default function ConsentModal({
  onAccept,
  onDecline,
  downloadSize,
}: ConsentModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h3 className="mb-2 text-lg font-semibold">Download Required</h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          This action needs to download a ~{downloadSize} conversion engine (one-time,
          then cached offline). Continue?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onDecline}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
