export interface CircularTextRing {
  radius: number;
  text: string;
  truncated: boolean;
}

export interface FittedCircularText {
  fontSize: number;
  rings: CircularTextRing[];
  wasReduced: boolean;
}

export function layoutCircularText(
  value: string,
  radii: number[],
  fontSize: number,
  spreadAcrossRings = false,
): CircularTextRing[] {
  const normalized = value.replaceAll(/\s+/g, ' ').trim();
  if (!normalized || fontSize <= 0) return [];
  let remaining = normalized;
  const rings: CircularTextRing[] = [];
  const physicalCapacities = radii.map((radius) =>
    getCircularTextCapacity(radius, fontSize),
  );
  const remainingCapacities = new Array<number>(physicalCapacities.length);
  let accumulatedCapacity = 0;
  for (let index = physicalCapacities.length - 1; index >= 0; index -= 1) {
    accumulatedCapacity += physicalCapacities[index];
    remainingCapacities[index] = accumulatedCapacity;
  }

  for (const [index, radius] of radii.entries()) {
    if (!remaining) break;
    const physicalCapacity = physicalCapacities[index];
    const remainingCapacity = remainingCapacities[index];
    const capacity = spreadAcrossRings
      ? Math.min(
          physicalCapacity,
          Math.max(
            12,
            Math.ceil(
              (remaining.length * physicalCapacity) / remainingCapacity,
            ),
          ),
        )
      : physicalCapacity;
    const isLastRing = rings.length === radii.length - 1;
    let text = remaining;
    let truncated = false;

    if (remaining.length > capacity) {
      const boundary = remaining.lastIndexOf(' ', capacity);
      const splitAt =
        boundary >= Math.floor(capacity * 0.55) ? boundary : capacity;
      text = remaining.slice(0, splitAt).trim();
      remaining = remaining.slice(splitAt).trim();
      if (isLastRing && remaining) {
        text = `${text.slice(0, Math.max(1, capacity - 1)).trimEnd()}…`;
        remaining = '';
        truncated = true;
      }
    } else {
      remaining = '';
    }

    rings.push({ radius, text, truncated });
  }

  return rings;
}

export function fitCircularText(
  value: string,
  {
    outerRadius,
    innerRadius,
    requestedFontSize,
    minimumFontSize,
    preferredRingCount,
    maximumRingCount = 36,
  }: {
    outerRadius: number;
    innerRadius: number;
    requestedFontSize: number;
    minimumFontSize: number;
    preferredRingCount: number;
    maximumRingCount?: number;
  },
): FittedCircularText {
  const normalizedLength = value.replaceAll(/\s+/g, ' ').trim().length;
  if (!normalizedLength || requestedFontSize <= 0) {
    return { fontSize: requestedFontSize, rings: [], wasReduced: false };
  }

  const lowestFontSize = Math.min(requestedFontSize, minimumFontSize);
  const createLayout = (fontSize: number) => {
    const availableRadius = Math.max(0, outerRadius - innerRadius);
    const physicalRingCount = Math.max(
      1,
      Math.min(
        maximumRingCount,
        Math.floor(availableRadius / (fontSize * 1.22)) + 1,
      ),
    );
    const ringCount = Math.min(
      physicalRingCount,
      Math.max(1, preferredRingCount),
    );
    const radii = createEvenRadii(outerRadius, innerRadius, ringCount);
    const totalCapacity = radii.reduce(
      (sum, radius) => sum + getCircularTextCapacity(radius, fontSize),
      0,
    );
    const wrappingReserve = ringCount * 8;
    const rings = layoutCircularText(value, radii, fontSize, true);
    const fitsWithoutTruncation = rings.every((ring) => !ring.truncated);
    return {
      fontSize,
      rings,
      fits:
        totalCapacity >= normalizedLength + wrappingReserve &&
        fitsWithoutTruncation,
    };
  };

  const requestedLayout = createLayout(requestedFontSize);
  if (requestedLayout.fits) {
    return {
      fontSize: requestedFontSize,
      rings: requestedLayout.rings,
      wasReduced: false,
    };
  }

  let bestLayout = createLayout(lowestFontSize);
  if (bestLayout.fits && lowestFontSize < requestedFontSize) {
    let lowerBound = lowestFontSize;
    let upperBound = requestedFontSize;
    // A bounded binary search replaces up to ~70 complete layouts from the
    // previous incremental scan. This keeps long-lyrics editing responsive.
    for (let iteration = 0; iteration < 10; iteration += 1) {
      const candidateSize = (lowerBound + upperBound) / 2;
      const candidateLayout = createLayout(candidateSize);
      if (candidateLayout.fits) {
        bestLayout = candidateLayout;
        lowerBound = candidateSize;
      } else {
        upperBound = candidateSize;
      }
    }
    return {
      fontSize: bestLayout.fontSize,
      rings: bestLayout.rings,
      wasReduced: true,
    };
  }

  return {
    fontSize: lowestFontSize,
    rings: bestLayout.rings,
    wasReduced: lowestFontSize < requestedFontSize * 0.995,
  };
}

function getCircularTextCapacity(radius: number, fontSize: number): number {
  // Uppercase lyrics use a semibold sans-serif plus explicit tracking in the
  // template. Keeping this estimate conservative prevents SVG textPath from
  // clipping the final words even when a ring contains many wide glyphs.
  return Math.max(12, Math.floor((2 * Math.PI * radius) / (fontSize * 0.7)));
}

function createEvenRadii(
  outerRadius: number,
  innerRadius: number,
  count: number,
): number[] {
  return Array.from({ length: count }, (_, index) =>
    count === 1
      ? outerRadius
      : outerRadius - (index * (outerRadius - innerRadius)) / (count - 1),
  );
}
