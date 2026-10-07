import { useEffect, useState } from "react";

export function useFetch(fn, deps = []) {
  const [state, set] = useState({ data: null, loading: true, error: "" });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    set((s) => ({ ...s, loading: true, error: "" }));
    fn()
      .then((data) => alive && set({ data, loading: false, error: "" }))
      .catch((e) => alive && set({ data: null, loading: false, error: e.message }));
    return () => { alive = false; };
    // eslint-disable-next-line
  }, [...deps, tick]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}

export function useDebounce(value, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export function useForm(initial) {
  const [values, setValues] = useState(initial);
  const bind = (name) => ({
    name,
    value: values[name] ?? "",
    onChange: (e) => setValues((v) => ({ ...v, [name]: e.target.type === "checkbox" ? e.target.checked : e.target.value })),
  });
  return { values, setValues, bind };
}
