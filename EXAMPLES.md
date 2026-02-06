# ColorEx Examples

This document provides practical examples of URL patterns you can use with ColorEx.

## Basic Wildcard Examples

### Match Any Site With a Keyword

```
Pattern: *github*
Matches: 
  ✓ https://github.com
  ✓ https://gist.github.com
  ✓ https://github.io
  ✗ https://gitlab.com
```

### Match Exact Domain

```
Pattern: https://www.example.com/*
Matches:
  ✓ https://www.example.com/page
  ✓ https://www.example.com/about/us
  ✗ https://example.com (missing www)
  ✗ http://www.example.com (wrong protocol)
```

### Match Any Subdomain

```
Pattern: *.example.com*
Matches:
  ✓ https://blog.example.com
  ✓ https://api.example.com/v1
  ✓ https://www.example.com
  ✗ https://example.com (no subdomain)
```

### Development Environments

```
Pattern: *localhost*
Color: #10b981 (Green)
Matches:
  ✓ http://localhost:3000
  ✓ https://localhost:8080/app
  ✓ http://localhost
```

```
Pattern: *127.0.0.1*
Color: #10b981 (Green)  
Matches:
  ✓ http://127.0.0.1:3000
  ✓ https://127.0.0.1:8080
```

### Work vs Personal

```
Pattern: *.company.com*
Color: #3b82f6 (Blue - Work)
Matches: All company domains
```

```
Pattern: *mail.google.com*
Color: #ef4444 (Red - Personal)
Matches: Gmail
```

## Advanced Regular Expression Examples

### Require HTTPS

```
Pattern: ^https://secure\.site\.com/.*
Matches:
  ✓ https://secure.site.com/dashboard
  ✗ http://secure.site.com/dashboard
```

### Multiple Domains

```
Pattern: (github|gitlab|bitbucket)\.com
Color: #6366f1 (Purple - Code Hosting)
Matches:
  ✓ https://github.com/repos
  ✓ https://gitlab.com/projects
  ✓ https://bitbucket.com/workspace
  ✗ https://codeberg.org
```

### Social Media Sites

```
Pattern: (facebook|twitter|instagram|linkedin)\.com
Color: #ec4899 (Pink - Social)
Matches:
  ✓ https://twitter.com/username
  ✓ https://instagram.com/profile
  ✓ https://facebook.com/page
  ✓ https://linkedin.com/in/profile
```

### File Types

```
Pattern: ^https://.*\.(pdf|doc|docx)$
Color: #f59e0b (Orange - Documents)
Matches:
  ✓ https://example.com/file.pdf
  ✓ https://docs.site.com/manual.docx
  ✗ https://example.com/image.png
```

### Documentation Sites

```
Pattern: ^https://.*\.(readthedocs\.io|github\.io)/.*
Color: #8b5cf6 (Purple - Docs)
Matches:
  ✓ https://project.readthedocs.io/en/latest/
  ✓ https://username.github.io/project/
  ✗ https://example.com/docs
```

### Shopping Sites

```
Pattern: (amazon|ebay|etsy)\.com
Color: #f97316 (Orange - Shopping)
Matches:
  ✓ https://amazon.com/product
  ✓ https://www.ebay.com/item
  ✓ https://etsy.com/shop
```

### News Sites

```
Pattern: (cnn|bbc|reuters|nytimes)\.com
Color: #dc2626 (Red - News)
Matches:
  ✓ https://cnn.com/article
  ✓ https://bbc.com/news
  ✓ https://reuters.com/world
  ✓ https://nytimes.com/section
```

## Pattern Combinations

### Development Stack

```
1. *localhost* → Green (#10b981) - Local dev
2. *.dev.company.com* → Yellow (#eab308) - Dev environment
3. *.staging.company.com* → Orange (#f97316) - Staging
4. *.company.com* → Blue (#3b82f6) - Production
```

### Content Types

```
1. ^https://.*\.(jpg|png|gif|svg)$ → Purple (#a855f7) - Images
2. ^https://.*\.(mp4|avi|mov)$ → Pink (#ec4899) - Videos  
3. ^https://.*\.(pdf|doc)$ → Orange (#f59e0b) - Documents
4. ^https://.*\.(zip|tar|gz)$ → Red (#ef4444) - Archives
```

### Educational

```
1. (wikipedia|wikimedia)\.org → Blue (#3b82f6) - Reference
2. *.edu → Green (#10b981) - Educational
3. (coursera|udemy|edx)\.com → Purple (#8b5cf6) - Online courses
4. (stackoverflow|stackexchange)\.com → Orange (#f97316) - Q&A
```

## Tips for Creating Patterns

### For Wildcards:

1. **Start and end with `*`** to match anywhere: `*keyword*`
2. **Use `?` for single character**: `file?.txt` matches `file1.txt`, `fileA.txt`
3. **Combine multiple `*`**: `https://*/api/*` matches any API endpoint

### For Regular Expressions:

1. **Use `^` and `$`** for exact matching:
   - `^https://example\.com$` only matches that exact URL
   - Without `^` and `$`, it matches anywhere in the string

2. **Escape special characters** with `\`:
   - `.` becomes `\.`
   - `?` becomes `\?`
   - `/` becomes `\/`

3. **Use `.*` instead of `*`** in regex:
   - Wildcard: `*` means "zero or more of any character"
   - Regex: `.*` means "zero or more of any character"
   - Regex: `*` alone is invalid!

4. **Use `|` for alternatives**:
   - `(option1|option2|option3)` matches any of the three

5. **Use `?` for optional**:
   - `https?` matches both `http` and `https`
   - `colou?r` matches both `color` and `colour`

## Testing Your Patterns

Always use the built-in Expression Validator before saving:

1. Enter your pattern
2. Enter a test URL
3. Click "Validate"
4. Adjust pattern if needed

## Common Mistakes

### Mistake: Using regex in wildcard mode

```
❌ Pattern: *.example.com$ (mixing wildcard * with regex $)
✓ Pattern: *.example.com* (all wildcards) OR
✓ Pattern: ^.*\.example\.com$ (all regex)
```

### Mistake: Not escaping dots in regex

```
❌ Pattern: https://example.com (matches example-com too!)
✓ Pattern: https://example\.com (correct)
```

### Mistake: Forgetting protocol

```
❌ Pattern: example.com/* (won't match https://example.com)
✓ Pattern: *example.com/* (matches with any protocol)
```

## Performance Tips

1. Order patterns from most specific to least specific
2. Disable patterns you're not currently using
3. Avoid overly complex regex patterns
4. Test patterns with the validator first

## Community Examples

Share your patterns! Here are some creative uses:

### Color Code by Time of Day
Create different mappings and enable/disable them based on your schedule.

### Project-Based Colors
Use different colors for different client projects or codebases.

### Learning Mode
Use distinct colors for educational vs entertainment sites to build awareness.

### Focus Mode  
Disable all patterns except work-related ones to reduce distraction cues.
