# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Create default questions if none exist
if Question.count == 0
  questions_data = [
    {
      text: "Tell us about yourself",
      prompt: "Evaluate this self-introduction for clarity, confidence, and professionalism. Consider how well the candidate presents themselves and communicates their background. Look for structure, enthusiasm, and relevant information. Return only an integer score between 1 and 5.",
      order: 1
    },
    {
      text: "What's your greatest achievement?",
      prompt: "Assess this achievement story for impact, specificity, and demonstration of skills. Consider whether the candidate provides concrete details, explains the significance, and shows problem-solving abilities. Look for measurable results and personal growth. Return only an integer score between 1 and 5.",
      order: 2
    },
    {
      text: "Where do you see yourself in 5 years?",
      prompt: "Evaluate this career planning response for realism, ambition, and alignment with the role. Consider whether the candidate shows clear goals, understands career progression, and demonstrates commitment to growth. Look for thoughtful planning and realistic expectations. Return only an integer score between 1 and 5.",
      order: 3
    },
    {
      text: "Why do you want to work with us?",
      prompt: "Assess this motivation response for research, genuine interest, and cultural fit. Consider whether the candidate demonstrates knowledge of the company, shows enthusiasm for the role, and explains their interest clearly. Look for specific reasons and alignment with company values. Return only an integer score between 1 and 5.",
      order: 4
    },
    {
      text: "How do you handle working under pressure?",
      prompt: "Evaluate this stress management response for practical strategies, self-awareness, and resilience. Consider whether the candidate provides specific examples, shows emotional intelligence, and demonstrates effective coping mechanisms. Look for realistic approaches and learning from challenges. Return only an integer score between 1 and 5.",
      order: 5
    }
  ]

  questions_data.each do |question_data|
    Question.create!(question_data)
  end

  puts "Created #{Question.count} default questions"
else
  puts "Questions already exist, skipping seed data"
end

# Create default job description if none exist or if no active ones exist
if JobDescription.count == 0 || JobDescription.where(active: true).count == 0
  # Deactivate any existing job descriptions first
  JobDescription.update_all(active: false) if JobDescription.count > 0
  
  JobDescription.create!(
    title: "Software Engineer",
    description: "We are looking for a talented Software Engineer to join our dynamic team. The ideal candidate should have strong programming skills, experience with modern web technologies, and a passion for creating high-quality software solutions. Responsibilities include developing new features, maintaining existing code, collaborating with cross-functional teams, and contributing to technical architecture decisions. We value creativity, problem-solving abilities, and a commitment to continuous learning.",
    active: true
  )
  puts "Created default job description"
else
  puts "Active job description already exists, skipping seed data"
end
