Integrating auth is definitely a bit of a pain. Simply concatenating the docs
and the client sdk code isn't enough to get it quite right. I think we'll need
to tailor examples to make it work.

--

Making pagination work required a few prompts. Claude thought our Cursor
component was relevant but it wasn't at all. It then tried to do an aggregate
query with counts. After hinting to it to look closer at how pagination works in
Instant it seemed to have understood

> Count doesn't exist on posts, why are you loading that? Take a closer look at how pagination works on instant

--

Claude easily adds the view page for a post

--

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
