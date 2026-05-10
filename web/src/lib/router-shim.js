'use client';

import NextLink from 'next/link';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';

const STATE_PREFIX = '__rr_state:';

const toHref = (to) => {
  if (typeof to === 'string') return to;
  if (!to || typeof to !== 'object') return '/';

  const pathname = to.pathname || '';
  const search = to.search ? `${to.search}` : '';
  const hash = to.hash ? `${to.hash}` : '';

  return `${pathname}${search && !search.startsWith('?') ? `?${search}` : search}${hash && !hash.startsWith('#') ? `#${hash}` : hash}`;
};

const stateKey = (href) => `${STATE_PREFIX}${href}`;

const storeState = (href, state) => {
  if (state === undefined || typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(stateKey(href), JSON.stringify(state));
  } catch (_error) {
    // React Router silently carries non-persistent history state; the shim does best effort.
  }
};

const readState = (href) => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(stateKey(href));
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

export const Link = forwardRef(function Link(
  { to, href: hrefProp, state, onClick, replace, ...rest },
  ref
) {
  const href = toHref(hrefProp ?? to);

  const handleClick = (event) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      storeState(href, state);
    }
  };

  return (
    <NextLink
      ref={ref}
      href={href}
      replace={replace}
      onClick={handleClick}
      {...rest}
    />
  );
});

export const useNavigate = () => {
  const router = useRouter();

  return useCallback(
    (to, options = {}) => {
      if (typeof to === 'number') {
        if (to === -1) {
          router.back();
        }
        return;
      }

      const href = toHref(to);
      storeState(href, options.state);

      if (options.replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    },
    [router]
  );
};

export const useLocation = () => {
  const pathname = usePathname() || '/';
  const nextSearchParams = useNextSearchParams();
  const [hash, setHash] = useState('');
  const searchString = nextSearchParams?.toString() || '';
  const search = searchString ? `?${searchString}` : '';
  const href = `${pathname}${search}${hash}`;

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash || '');

    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, [pathname, searchString]);

  return useMemo(
    () => ({
      pathname,
      search,
      hash,
      state: readState(href),
    }),
    [pathname, search, hash, href]
  );
};

const createSearchParams = (value) => {
  if (value instanceof URLSearchParams) {
    return new URLSearchParams(value.toString());
  }

  if (typeof value === 'string') {
    return new URLSearchParams(value.startsWith('?') ? value.slice(1) : value);
  }

  if (Array.isArray(value)) {
    return new URLSearchParams(value);
  }

  const params = new URLSearchParams();
  Object.entries(value || {}).forEach(([key, entryValue]) => {
    if (entryValue === undefined || entryValue === null) return;

    if (Array.isArray(entryValue)) {
      entryValue.forEach((item) => params.append(key, item));
    } else {
      params.set(key, entryValue);
    }
  });
  return params;
};

export const useSearchParams = () => {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const nextSearchParams = useNextSearchParams();
  const currentSearch = nextSearchParams?.toString() || '';

  const params = useMemo(() => new URLSearchParams(currentSearch), [currentSearch]);

  const setSearchParams = useCallback(
    (nextInit, options = {}) => {
      const baseParams = new URLSearchParams(currentSearch);
      const resolvedParams =
        typeof nextInit === 'function' ? nextInit(baseParams) : nextInit;
      const targetParams = createSearchParams(resolvedParams);
      const query = targetParams.toString();
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const href = query ? `${pathname}?${query}${hash}` : `${pathname}${hash}`;

      if (options.replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    },
    [currentSearch, pathname, router]
  );

  return [params, setSearchParams];
};

export const Navigate = ({ to, replace = false, state }) => {
  const navigate = useNavigate();
  const href = toHref(to);

  useEffect(() => {
    navigate(href, { replace, state });
  }, [href, navigate, replace, state]);

  return null;
};

export { useParams };
