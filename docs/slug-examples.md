// Example demonstration of slug generation for ailments

/*
INPUT: "Headache"
OUTPUT: "headache"

INPUT: "Cold & Flu"  
OUTPUT: "cold-and-flu"

INPUT: "Anxiety & Depression"
OUTPUT: "anxiety-and-depression"

INPUT: "Joint Pain!!!"
OUTPUT: "joint-pain"

INPUT: "Multiple   Spaces   Test"
OUTPUT: "multiple-spaces-test"

INPUT: "Special@#$%Characters"
OUTPUT: "specialcharacters"

INPUT: "Nasal polyps"
OUTPUT: "nasal-polyps"

INPUT: "Back pain"
OUTPUT: "back-pain"

INPUT: "High blood pressure"
OUTPUT: "high-blood-pressure"

INPUT: "Cuts, bruises, and burns"
OUTPUT: "cuts-bruises-and-burns"

UNIQUE SLUG HANDLING:
If "headache" already exists:
- First duplicate: "headache-2"
- Second duplicate: "headache-3"
- And so on...

URL EXAMPLES:
/ailments/headache
/ailments/cold-and-flu
/ailments/anxiety-and-depression
/ailments/joint-pain
/ailments/back-pain-2 (if "back-pain" exists)
*/