Claude seems to prefer `init<AppSchema>` instead of just `init`

--

Asking claude to implement the index page produced mostly working code but one
gotcha was that it tried to using ordering

```javascript
  const { data, isLoading } = db.useQuery({
    posts: {
      $: {
        order: { updatedAt: 'desc' }
      }
    }
  });
```

This silently fails because `updatedAt` needs to be indexed. Prompting Claude
about this got it to do the right thing!

> This didn't quite work because you need to make sure that updatedAt is indexed, we need to set that in the schema and then push it up via the cli. Can you show me how to do that?
