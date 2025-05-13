
// Find and fix the toast call in the file that's causing the error
// Look for a toast call with a duration property and remove it
// For example, change:
// toast({
//   title: "Success",
//   description: "Track added successfully!",
//   duration: 3000
// });

// To:
toast({
  title: "Success",
  description: "Track added successfully!",
  variant: "default"
});
