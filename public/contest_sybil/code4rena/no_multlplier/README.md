# Sybil Attack Profitability Analysis - NO_MULT Severity
Generated on: 2025-01-31 19:00:49

## Analysis Parameters
- Severity: NO_MULT (1 points)
- Total submissions range (n): 2 to 19
- Controlled submissions range (k): 2 to 19
- Scoring formula: h(n) = 1 * 0.85^(n-1) / n

## Plot Descriptions
1. heatmap_profitability.png
   - Shows profit difference between sybil attack and honest submission
   - Positive values indicate profitable sybil attack scenarios
   - Negative values indicate unprofitable scenarios
   - Invalid combinations where k ≥ n aren't shown

2. line_plot_profitability.png
   - Shows profitability curves for each n value
   - Points above zero indicate profitable scenarios
   - Points below zero indicate unprofitable scenarios

3. 3d_surface_profitability.png
   - 3D visualization of the profitability landscape
   - Helps identify optimal (n,k) combinations

4. loss_heatmap.png
   - Shows percentage point loss for other user when attacker controls k vs 1 submission
   - Positive values indicate points lost by other users
