'use client'
import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

export function ListingImage(props: ImageProps) {
  return <ImageWithFallback key={String(props.src)} {...props} />
}
function ImageWithFallback(props: ImageProps) {
  const [failed, setFailed] = useState(false)
  return <Image {...props} src={failed ? '/placeholders/property.svg' : props.src}
    alt={failed ? 'Photo unavailable' : props.alt} unoptimized={failed || props.unoptimized}
    onError={event => { if (!failed) setFailed(true); props.onError?.(event) }} />
}
