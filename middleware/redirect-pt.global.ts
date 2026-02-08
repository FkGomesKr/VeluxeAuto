export default defineNuxtRouteMiddleware((to) => {
  // Redirect /pt/ and /pt/* to / and /* (since pt is the default locale)
  // This prevents 404 errors when /pt routes are accessed
  if (to.path.startsWith('/pt/') || to.path === '/pt') {
    const pathWithoutPt = to.path.replace(/^\/pt/, '') || '/'
    
    // Redirect immediately, preserving query params and hash
    return navigateTo({
      path: pathWithoutPt,
      query: to.query,
      hash: to.hash
    }, { 
      replace: true
    })
  }
})
